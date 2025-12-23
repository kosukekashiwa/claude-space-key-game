import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import { Gift, Star } from "lucide-react";

const starsStyles = Array.from({ length: 50 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: `${Math.random() * 3 + 2}s`,
}));

const ChristmasGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [santaY, setSantaY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [presents, setPresents] = useState([]);
  const gameLoopRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const presentTimerRef = useRef(null);

  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -10;
  const SANTA_SIZE = 60;
  const GAME_HEIGHT = 600;
  const GAME_WIDTH = 800;

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSantaY(250);
    setVelocity(0);
    setObstacles([]);
    setPresents([]);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!gameStarted && !gameOver) {
          setGameStarted(true);
        } else if (gameOver) {
          resetGame();
        } else {
          setVelocity(JUMP_STRENGTH);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setSantaY((prev) => {
        const newY = prev + velocity;
        if (newY < 0 || newY > GAME_HEIGHT - SANTA_SIZE) {
          setGameOver(true);
          return prev;
        }
        return newY;
      });

      setVelocity((prev) => prev + GRAVITY);

      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({ ...obs, x: obs.x - 5 }))
          .filter((obs) => obs.x > -100);
        return updated;
      });

      setPresents((prev) => {
        const updated = prev
          .map((p) => ({ ...p, x: p.x - 5 }))
          .filter((p) => p.x > -50);
        return updated;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver, velocity]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    obstacleTimerRef.current = setInterval(() => {
      const height = Math.random() * 200 + 100;
      const gap = 180;
      setObstacles((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: GAME_WIDTH,
          topHeight: height,
          bottomY: height + gap,
          passed: false,
        },
      ]);
    }, 2000);

    return () => clearInterval(obstacleTimerRef.current);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    presentTimerRef.current = setInterval(() => {
      const y = Math.random() * (GAME_HEIGHT - 100) + 50;
      setPresents((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: GAME_WIDTH,
          y: y,
        },
      ]);
    }, 3000);

    return () => clearInterval(presentTimerRef.current);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    obstacles.forEach((obs) => {
      if (obs.x < 100 && obs.x > 50 && !obs.passed) {
        const collision =
          santaY < obs.topHeight || santaY + SANTA_SIZE > obs.bottomY;
        if (collision) {
          setGameOver(true);
        } else if (obs.x < 50) {
          obs.passed = true;
          setScore((prev) => prev + 1);
        }
      }
    });

    presents.forEach((present, index) => {
      if (
        present.x < 100 &&
        present.x > 50 &&
        santaY < present.y + 30 &&
        santaY + SANTA_SIZE > present.y
      ) {
        setPresents((prev) => prev.filter((_, i) => i !== index));
        setScore((prev) => prev + 5);
      }
    });
  }, [obstacles, presents, santaY, gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          🎅 サンタのクリスマスフライト 🎄
        </h1>
        <p className="text-xl text-white drop-shadow">スコア: {score}</p>
      </div>

      <div
        className="relative bg-gradient-to-b from-indigo-900 to-blue-800 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* 雪の背景 */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <Star
              key={i}
              className="absolute text-white opacity-30"
              size={8}
              style={{
                left: starsStyles[i]?.left,
                top: starsStyles[i]?.top,
                animation: `twinkle ${starsStyles[i]?.duration}s infinite`,
              }}
            />
          ))}
        </div>

        {/* サンタ */}
        {(gameStarted || !gameOver) && (
          <div
            className="absolute text-5xl transition-transform"
            style={{
              left: 80,
              top: santaY,
              transform: `rotate(${velocity * 3}deg)`,
            }}
          >
            🛷
          </div>
        )}

        {/* 障害物（煙突） */}
        {obstacles.map((obs) => (
          <div key={obs.id}>
            <div
              className="absolute bg-red-800 border-4 border-red-900 rounded-t-lg"
              style={{
                left: obs.x,
                top: 0,
                width: 60,
                height: obs.topHeight,
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-700"></div>
            </div>
            <div
              className="absolute bg-red-800 border-4 border-red-900 rounded-b-lg"
              style={{
                left: obs.x,
                top: obs.bottomY,
                width: 60,
                height: GAME_HEIGHT - obs.bottomY,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-4 bg-gray-700"></div>
            </div>
          </div>
        ))}

        {/* プレゼント */}
        {presents.map((present) => (
          <div
            key={present.id}
            className="absolute"
            style={{
              left: present.x,
              top: present.y,
            }}
          >
            <Gift className="text-yellow-300" size={30} />
          </div>
        ))}

        {/* スタート画面 */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <p className="text-2xl mb-4">スペースキーでスタート！</p>
              <p className="text-lg">煙突を避けて、プレゼントを集めよう 🎁</p>
            </div>
          </div>
        )}

        {/* ゲームオーバー */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center text-white">
              <p className="text-4xl mb-4">🎄 ゲームオーバー 🎄</p>
              <p className="text-2xl mb-2">スコア: {score}</p>
              <p className="text-xl">スペースキーでリトライ</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        <p className="text-sm">💡 スペースキーを押してそりを浮かせよう！</p>
        <p className="text-xs mt-2">煙突 = +1点 | プレゼント = +5点</p>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasGame;
