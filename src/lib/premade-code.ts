/**
 * Premade code templates for free users
 * These are actual code files that get written to the filesystem
 */

export const PREMADE_CODE = {
  "landing-page": {
    "app/page.tsx": `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="text-center text-white px-6 z-10 max-w-4xl">
        <h1 className="text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
          Welcome to the Future
        </h1>
        <p className="text-2xl mb-10 opacity-90 leading-relaxed">
          Build amazing things with our powerful platform.<br />
          Join thousands of creators already building the next big thing.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <button className="bg-white text-purple-600 px-10 py-4 rounded-full font-semibold text-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 transform hover:bg-yellow-100">
            Get Started Free
          </button>
          <button className="border-3 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:scale-110 hover:bg-white hover:text-purple-600 transition-all duration-300 transform backdrop-blur-sm bg-white/10">
            Watch Demo
          </button>
        </div>
        <div className="mt-16 flex justify-center gap-12 text-sm opacity-80">
          <div>
            <div className="text-3xl font-bold">10K+</div>
            <div>Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50K+</div>
            <div>Projects Created</div>
          </div>
          <div>
            <div className="text-3xl font-bold">99%</div>
            <div>Satisfaction</div>
          </div>
        </div>
      </div>
    </main>
  );
}`,
  },
  "snake-game": {
    "app/page.tsx": `"use client";

import { useEffect, useRef, useState } from "react";

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let gameLoop: NodeJS.Timeout;

    function clearCanvas() {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnake() {
      ctx.fillStyle = "#10b981";
      snake.forEach((segment, index) => {
        if (index === 0) {
          // Head with gradient
          const gradient = ctx.createLinearGradient(
            segment.x * gridSize,
            segment.y * gridSize,
            (segment.x + 1) * gridSize,
            (segment.y + 1) * gridSize
          );
          gradient.addColorStop(0, "#10b981");
          gradient.addColorStop(1, "#34d399");
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = "#10b981";
        }
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
    }

    function drawFood() {
      const gradient = ctx.createRadialGradient(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        0,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2
      );
      gradient.addColorStop(0, "#ef4444");
      gradient.addColorStop(1, "#dc2626");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    function moveSnake() {
      if (!gameStarted || gameOver) return;
      
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      if (head.x === food.x && head.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount),
        };
      } else {
        snake.pop();
      }

      snake.unshift(head);

      if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount ||
        snake.slice(1).some((s) => s.x === head.x && s.y === head.y)
      ) {
        setGameOver(true);
        return;
      }
    }

    function gameLoopFunc() {
      if (gameOver || !gameStarted) return;
      moveSnake();
      clearCanvas();
      drawSnake();
      drawFood();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === "ArrowUp" || e.key === "w" || e.key === "W")) {
        setGameStarted(true);
        dx = 0;
        dy = -1;
        return;
      }
      if (gameOver) return;
      if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && dy !== 1) {
        dx = 0;
        dy = -1;
      } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && dy !== -1) {
        dx = 0;
        dy = 1;
      } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && dx !== 1) {
        dx = -1;
        dy = 0;
      } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && dx !== -1) {
        dx = 1;
        dy = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    gameLoop = setInterval(gameLoopFunc, 120);

    clearCanvas();
    if (gameStarted) {
      drawSnake();
      drawFood();
    } else {
      ctx.fillStyle = "#10b981";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Press ↑ or W to Start", canvas.width / 2, canvas.height / 2);
    }

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStarted, highScore]);

  const resetGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          🐍 Snake Game
        </h1>
        <div className="flex gap-8 justify-center mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">Score: {score}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">High: {highScore}</div>
          </div>
        </div>
      </div>
      
      {gameOver && (
        <div className="mb-4 text-center">
          <div className="text-red-500 text-2xl font-bold mb-4 animate-pulse">
            Game Over! Final Score: {score}
          </div>
          <button
            onClick={resetGame}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-green-500 rounded"
        />
      </div>
      
      <div className="mt-6 text-center text-sm opacity-70">
        <p>Use ↑↓←→ or WASD to control</p>
        {!gameStarted && !gameOver && <p className="mt-2 text-green-400">Press ↑ or W to start!</p>}
      </div>
    </div>
  );
}`,
  },
  "bakery-store": {
    "app/page.tsx": `"use client";

import { useState } from "react";

const products = [
  { id: 1, name: "Chocolate Cake", price: 25, image: "🍰", description: "Rich chocolate cake with cream" },
  { id: 2, name: "Blueberry Muffin", price: 5, image: "🧁", description: "Fresh blueberries baked in" },
  { id: 3, name: "Butter Croissant", price: 4, image: "🥐", description: "Flaky and buttery perfection" },
  { id: 4, name: "Glazed Donut", price: 3, image: "🍩", description: "Sweet glazed classic donut" },
  { id: 5, name: "French Baguette", price: 6, image: "🥖", description: "Crispy crust, soft inside" },
  { id: 6, name: "Chocolate Cookies", price: 8, image: "🍪", description: "Homemade chocolate chip" },
  { id: 7, name: "Apple Pie", price: 12, image: "🥧", description: "Warm cinnamon apple pie" },
  { id: 8, name: "Cupcake", price: 4, image: "🧁", description: "Vanilla with rainbow sprinkles" },
];

export default function BakeryStore() {
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([]);

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            🍞 Sweet Bakery
          </h1>
          <p className="text-xl text-gray-600">Fresh baked goods made with love daily!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-orange-200"
            >
              <div className="text-7xl mb-4 transform hover:scale-110 transition-transform">
                {product.image}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{product.description}</p>
              <p className="text-3xl font-bold text-orange-600 mb-4">
                \${product.price}
              </p>
              <button
                onClick={() => addToCart(product.id)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 w-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              🛒 Shopping Cart
            </h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{product?.image}</span>
                      <div>
                        <div className="font-semibold text-lg">{product?.name}</div>
                        <div className="text-sm text-gray-500">\${product?.price} each</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1 border-2 border-orange-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-orange-600 hover:text-orange-700 font-bold text-lg w-6 h-6 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-orange-600 hover:text-orange-700 font-bold text-lg w-6 h-6 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-bold text-xl text-orange-600 w-24 text-right">
                        \${((product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 text-xl px-3"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t-2 border-orange-200 pt-6 flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-800">Total:</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                \${getTotal().toFixed(2)}
              </span>
            </div>
            <button className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 w-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
              🎉 Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}`,
  },
};

/**
 * Get premade code files for a prompt
 */
export function getPremadeCode(prompt: string): Record<string, string> | null {
  const promptKey = Object.keys(PREMADE_CODE).find((key) => {
    if (prompt.toLowerCase().includes("landing")) return key === "landing-page";
    if (prompt.toLowerCase().includes("snake")) return key === "snake-game";
    if (prompt.toLowerCase().includes("bakery") || prompt.toLowerCase().includes("store")) {
      return key === "bakery-store";
    }
    return false;
  });

  if (!promptKey) {
    return null;
  }

  return PREMADE_CODE[promptKey as keyof typeof PREMADE_CODE] || null;
}
