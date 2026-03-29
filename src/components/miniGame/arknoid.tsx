"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TokenIcon, ExchangeIcon, WalletIcon } from "@web3icons/react/dynamic";
import { logger } from "@/lib/utils/logger";

// Base dimensions for scaling
const BASE_WIDTH = 375; // iPhone width
const BASE_HEIGHT = 667; // iPhone height
const ASPECT_RATIO = BASE_HEIGHT / BASE_WIDTH;

// Game constants (will be scaled based on viewport)
const PADDLE_WIDTH_RATIO = 0.2; // 20% of canvas width
const PADDLE_HEIGHT_RATIO = 0.025; // 2.5% of canvas height
const BALL_RADIUS_RATIO = 0.01875; // 1.875% of canvas width (1.25x larger)
const BRICK_HEIGHT_RATIO = 0.04; // 4% of canvas height
const BRICK_PADDING_RATIO = 0.01; // 1% of canvas width
const BRICK_OFFSET_TOP_RATIO = 0.08; // 8% from top
const BRICK_OFFSET_SIDE_RATIO = 0.05; // 5% from sides
const BRICK_ROWS = 6;
const GAME_TIME = 60;
const COUNTDOWN_TIME = 3;

// Icons configuration for bricks
const BRICK_ICONS: Array<{
  type: "token" | "exchange" | "wallet";
  id: string;
}> = [
  { type: "token", id: "btc" },
  { type: "token", id: "eth" },
  { type: "token", id: "bnb" },
  { type: "token", id: "sol" },
  { type: "token", id: "usdt" },
  { type: "token", id: "usdc" },
  { type: "exchange", id: "binance" },
  { type: "exchange", id: "okx" },
  { type: "exchange", id: "kraken" },
  { type: "wallet", id: "phantom" },
  { type: "wallet", id: "metamask" },
  { type: "exchange", id: "uniswap" },
];

interface Paddle {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Brick {
  x: number;
  y: number;
  iconType: "token" | "exchange" | "wallet";
  iconId: string;
  color: string;
  points: number;
  hit: boolean;
  powerUp: string | null;
}

interface PowerUp {
  x: number;
  y: number;
  type: string;
  dy: number;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
  size: number;
}

type GameState = "menu" | "countdown" | "playing" | "gameOver" | "won";

const BloomArknoid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [countdownTime, setCountdownTime] = useState(COUNTDOWN_TIME);
  const [isDragging, setIsDragging] = useState(false);
  const [touchOffset, setTouchOffset] = useState(0);

  // Dynamic dimensions based on viewport
  const [dimensions, setDimensions] = useState({
    canvasWidth: BASE_WIDTH,
    canvasHeight: BASE_HEIGHT,
    paddleWidth: 80,
    paddleHeight: 15,
    ballRadius: 6,
    brickSize: 30,
    brickPadding: 5,
    brickOffsetTop: 50,
    brickOffsetSide: 20,
    brickCols: 10,
  });

  // Game objects
  const [paddle, setPaddle] = useState<Paddle>({
    x: dimensions.canvasWidth / 2 - dimensions.paddleWidth / 2,
    y: dimensions.canvasHeight - 40,
  });
  const [ball, setBall] = useState<Ball>({
    x: dimensions.canvasWidth / 2,
    y: dimensions.canvasHeight - 60,
    dx: 3,
    dy: -3,
  });
  const [ballSpeed, setBallSpeed] = useState(3);
  const [speedIncrease, setSpeedIncrease] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Calculate dimensions based on viewport
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const menuHeight = window.innerHeight * 0.12; // 12vh for menu
    const availableHeight = window.innerHeight - menuHeight - 100; // Extra padding for stats

    let canvasWidth, canvasHeight;

    // For viewports wider than 1280px, show mobile-like layout but bigger
    if (window.innerWidth >= 1280) {
      // Calculate based on available height first
      canvasHeight = availableHeight * 0.9;
      canvasWidth = canvasHeight / ASPECT_RATIO;

      // If too wide, constrain by width instead
      if (canvasWidth > containerWidth * 0.5) {
        canvasWidth = containerWidth * 0.5;
        canvasHeight = canvasWidth * ASPECT_RATIO;
      }

      // Ensure minimum size
      canvasWidth = Math.max(canvasWidth, 375);
      canvasHeight = Math.max(canvasHeight, 667);
    } else {
      // For smaller viewports, use most of available space
      canvasWidth = Math.min(containerWidth * 0.95, window.innerWidth * 0.95);
      canvasHeight = canvasWidth * ASPECT_RATIO;

      // Adjust if height is constrained
      if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = canvasHeight / ASPECT_RATIO;
      }
    }

    // Calculate game element sizes based on canvas dimensions
    const paddleWidth = canvasWidth * PADDLE_WIDTH_RATIO;
    const paddleHeight = canvasHeight * PADDLE_HEIGHT_RATIO;
    const ballRadius = canvasWidth * BALL_RADIUS_RATIO;
    const brickHeight = canvasHeight * BRICK_HEIGHT_RATIO;
    const brickPadding = canvasWidth * BRICK_PADDING_RATIO;
    const brickOffsetTop = canvasHeight * BRICK_OFFSET_TOP_RATIO;
    const brickOffsetSide = canvasWidth * BRICK_OFFSET_SIDE_RATIO;

    // Calculate optimal brick columns based on canvas width
    const availableWidth = canvasWidth - 2 * brickOffsetSide;

    // Adjust brick size based on screen size
    let targetBrickWidth;
    if (canvasWidth > 600) {
      targetBrickWidth = 50; // Fixed size for larger screens
    } else {
      targetBrickWidth = canvasWidth * 0.1; // 10% for smaller screens
    }

    // Calculate columns based on target brick width
    let brickCols = Math.floor(
      (availableWidth + brickPadding) / (targetBrickWidth + brickPadding)
    );

    // Ensure reasonable number of columns
    brickCols = Math.max(8, Math.min(12, brickCols));

    setDimensions({
      canvasWidth: Math.floor(canvasWidth),
      canvasHeight: Math.floor(canvasHeight),
      paddleWidth: Math.floor(paddleWidth),
      paddleHeight: Math.floor(paddleHeight),
      ballRadius: Math.floor(ballRadius),
      brickSize: Math.floor(brickHeight),
      brickPadding: Math.floor(brickPadding),
      brickOffsetTop: Math.floor(brickOffsetTop),
      brickOffsetSide: Math.floor(brickOffsetSide),
      brickCols,
    });
  }, []);

  // Check collision for bricks (all treated as squares)
  const checkBrickCollision = (
    brick: Brick,
    ballX: number,
    ballY: number,
    ballRadius: number
  ): boolean => {
    const brickSize = dimensions.brickSize;
    return (
      ballX + ballRadius > brick.x &&
      ballX - ballRadius < brick.x + brickSize &&
      ballY + ballRadius > brick.y &&
      ballY - ballRadius < brick.y + brickSize
    );
  };

  // Initialize bricks with mixed icons
  const initializeBricks = () => {
    const newBricks: Brick[] = [];
    // Darker colors for better visibility
    const colors = [
      "#0099CC",
      "#CC00CC",
      "#00CC00",
      "#CCCC00",
      "#CC0066",
      "#00CC99",
      "#6600CC",
    ];

    // Point values for different icons
    const iconPoints: { [key: string]: number } = {
      btc: 60,
      eth: 50,
      bnb: 40,
      sol: 35,
      usdt: 30,
      usdc: 30,
      binance: 25,
      okx: 25,
      phantom: 22,
      metamask: 22,
      kraken: 20,
      uniswap: 20,
    };

    // Calculate brick dimensions
    const brickWidth =
      dimensions.canvasWidth > 600 ? 50 : dimensions.canvasWidth * 0.1;
    const totalBricksWidth =
      dimensions.brickCols * brickWidth +
      (dimensions.brickCols - 1) * dimensions.brickPadding;
    const startX = (dimensions.canvasWidth - totalBricksWidth) / 2; // Center horizontally

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < dimensions.brickCols; c++) {
        const iconConfig =
          BRICK_ICONS[Math.floor(Math.random() * BRICK_ICONS.length)];
        newBricks.push({
          x: startX + c * (brickWidth + dimensions.brickPadding),
          y:
            r * (dimensions.brickSize + dimensions.brickPadding) +
            dimensions.brickOffsetTop,
          iconType: iconConfig.type,
          iconId: iconConfig.id,
          color: colors[r % colors.length],
          points: iconPoints[iconConfig.id] || 10,
          hit: false,
          powerUp:
            Math.random() < 0.1
              ? ["multiball", "expand", "laser"][Math.floor(Math.random() * 3)]
              : null,
        });
      }
    }
    setBricks(newBricks);
  };

  // Touch/Mouse handlers
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (gameState !== "playing" && gameState !== "countdown") return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      // Check if touch/click is on paddle
      if (
        x >= paddle.x &&
        x <= paddle.x + dimensions.paddleWidth &&
        y >= paddle.y &&
        y <= paddle.y + dimensions.paddleHeight
      ) {
        setIsDragging(true);
        setTouchOffset(x - paddle.x);
      }
    },
    [
      gameState,
      paddle.x,
      paddle.y,
      dimensions.paddleWidth,
      dimensions.paddleHeight,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ((gameState !== "playing" && gameState !== "countdown") || !isDragging)
        return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;

      setPaddle((prev) => ({
        ...prev,
        x: Math.max(
          0,
          Math.min(
            dimensions.canvasWidth - dimensions.paddleWidth,
            x - touchOffset
          )
        ),
      }));
    },
    [
      gameState,
      isDragging,
      touchOffset,
      dimensions.canvasWidth,
      dimensions.paddleWidth,
    ]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard controls for desktop - smooth movement
  const [keysPressed, setKeysPressed] = useState({ left: false, right: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing" && gameState !== "countdown") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        setKeysPressed((prev) => ({ ...prev, left: true }));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        setKeysPressed((prev) => ({ ...prev, right: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setKeysPressed((prev) => ({ ...prev, left: false }));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setKeysPressed((prev) => ({ ...prev, right: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Continuous paddle movement when keys are held
  useEffect(() => {
    if (
      (gameState !== "playing" && gameState !== "countdown") ||
      (!keysPressed.left && !keysPressed.right)
    )
      return;

    const moveSpeed = 8; // Pixels per frame
    let animationId: number;

    const updatePaddle = () => {
      setPaddle((prev) => {
        let newX = prev.x;

        if (keysPressed.left) {
          newX = Math.max(0, prev.x - moveSpeed);
        } else if (keysPressed.right) {
          newX = Math.min(
            dimensions.canvasWidth - dimensions.paddleWidth,
            prev.x + moveSpeed
          );
        }

        return { ...prev, x: newX };
      });

      animationId = requestAnimationFrame(updatePaddle);
    };

    animationId = requestAnimationFrame(updatePaddle);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, keysPressed, dimensions.canvasWidth, dimensions.paddleWidth]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("gameOver");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, score]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "countdown" && countdownTime > 0) {
      interval = setInterval(() => {
        setCountdownTime((prev) => {
          if (prev <= 1) {
            setGameState("playing");
            return COUNTDOWN_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, countdownTime]);

  // Start game
  const startGame = () => {
    setGameState("countdown");
    setCountdownTime(COUNTDOWN_TIME);
    setScore(0);
    setTimeLeft(GAME_TIME);
    const initialSpeed = dimensions.canvasWidth / 62.5; // Double the speed (was /125)
    setBall({
      x: dimensions.canvasWidth / 2,
      y: dimensions.canvasHeight - 60,
      dx: initialSpeed,
      dy: -initialSpeed,
    });
    setBallSpeed(initialSpeed);
    setSpeedIncrease(0);
    setPaddle({
      x: dimensions.canvasWidth / 2 - dimensions.paddleWidth / 2,
      y: dimensions.canvasHeight - dimensions.paddleHeight - 25,
    });
    setPowerUps([]);
    setParticles([]);
    setKeysPressed({ left: false, right: false }); // Reset keys
    initializeBricks();
  };

  // Create particles effect
  const createParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5,
        life: 30,
        color,
        size: Math.random() * 4 + 2,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Generate share image
  const generateShareImage = useCallback(async () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return "";

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Twitter recommended size: 1200x675 (16:9)
    canvas.width = 1200;
    canvas.height = 675;

    // Background gradient - Bloom Protocol purple theme
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a0a2e");
    gradient.addColorStop(1, "#0f0514");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some decorative elements
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 100 + 50;
      ctx.fillStyle = ["#8478e0", "#E19DED", "#90D446", "#a855f7", "#c084fc"][
        Math.floor(Math.random() * 5)
      ];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("BLOOM ARKNOID", canvas.width / 2, 150);

    // Subtitle
    ctx.font = "36px Arial";
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText("Game Results", canvas.width / 2, 210);

    // Score box
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(canvas.width / 2 - 400, 280, 800, 200);
    ctx.strokeStyle = "#E19DED";
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width / 2 - 400, 280, 800, 200);

    // Score
    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "#90D446";
    ctx.fillText(score.toString(), canvas.width / 2, 410);

    ctx.font = "32px Arial";
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText("FINAL SCORE", canvas.width / 2, 450);

    // Speed indicator
    ctx.font = "48px Arial";
    ctx.fillStyle = "#8478e0";
    ctx.fillText(
      `Speed Boost: +${speedIncrease.toFixed(3)}`,
      canvas.width / 2,
      550
    );

    // Bottom text
    ctx.font = "28px Arial";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(
      "🌱 Bloom Protocol - Seed-strapping the future 🌱",
      canvas.width / 2,
      620
    );

    // Convert to data URL
    return canvas.toDataURL("image/png");
  }, [score, speedIncrease]);

  // Share functions
  // Declare downloadImage first since other functions depend on it
  const downloadImage = useCallback(async () => {
    const imageUrl = await generateShareImage();
    const link = document.createElement("a");
    link.download = `bloom-arknoid-score-${score}.png`;
    link.href = imageUrl;
    link.click();
  }, [score, generateShareImage]);

  const shareWithWebAPI = useCallback(async () => {
    const imageUrl = await generateShareImage();

    // Convert data URL to blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `bloom-arknoid-score-${score}.png`, {
      type: "image/png",
    });

    const shareData = {
      title: "Bloom Arknoid Score",
      text: `I scored ${score} points in Bloom Arknoid with a speed boost of +${speedIncrease.toFixed(
        3
      )}! Can you beat my score? 🎮🚀`,
      url: window.location.href,
    };

    // Check if can share with files
    if (navigator.share && navigator.canShare) {
      try {
        // Test if files are supported
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            ...shareData,
            files: [file],
          });
          return;
        }
        // Fallback to share without image
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          logger.error("Error sharing", { error });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      alert(
        "Sharing is not supported on this device. Image has been downloaded instead!"
      );
      downloadImage();
    }
  }, [score, speedIncrease, generateShareImage, downloadImage]);

  const shareOnTwitter = useCallback(async () => {
    // Try Web Share API first on mobile
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      shareWithWebAPI();
    } else {
      // Desktop fallback - just text
      const text = `I scored ${score} points in Bloom Arknoid with a speed boost of +${speedIncrease.toFixed(
        3
      )}! Can you beat my score? 🎮🚀`;
      const url = window.location.href;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank");

      // Also download the image
      downloadImage();
      alert("Image downloaded! You can attach it to your tweet manually.");
    }
  }, [score, speedIncrease, shareWithWebAPI, downloadImage]);

  const shareOnTelegram = useCallback(async () => {
    // Try Web Share API first on mobile
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      shareWithWebAPI();
    } else {
      // Desktop fallback - just text
      const text = `🎮 Bloom Arknoid Score!\n\nFinal Score: ${score}\nSpeed Boost: +${speedIncrease.toFixed(
        3
      )}\n\nPlay now: ${window.location.href}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, "_blank");

      // Also download the image
      downloadImage();
      alert(
        "Image downloaded! You can attach it to your Telegram message manually."
      );
    }
  }, [score, speedIncrease, shareWithWebAPI, downloadImage]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas with liquid glass gradient background
      const bgGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        dimensions.canvasHeight
      );
      bgGradient.addColorStop(0, "rgba(248, 248, 250, 0.95)");
      bgGradient.addColorStop(0.5, "rgba(250, 250, 252, 0.97)");
      bgGradient.addColorStop(1, "rgba(255, 255, 255, 0.99)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, dimensions.canvasWidth, dimensions.canvasHeight);

      // Add subtle glass reflection
      const glassGradient = ctx.createLinearGradient(
        0,
        0,
        dimensions.canvasWidth,
        0
      );
      glassGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      glassGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
      glassGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glassGradient;
      ctx.fillRect(0, 0, dimensions.canvasWidth, 60);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        p.size *= 0.96;

        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      setParticles((prev) => prev.filter((p) => p.life > 0));

      // Update ball position
      let newBallX = ball.x + ball.dx;
      let newBallY = ball.y + ball.dy;
      let newBallDx = ball.dx;
      let newBallDy = ball.dy;

      // Wall collisions
      if (
        newBallX + dimensions.ballRadius > dimensions.canvasWidth ||
        newBallX - dimensions.ballRadius < 0
      ) {
        newBallDx = -newBallDx;
      }
      if (newBallY - dimensions.ballRadius < 0) {
        newBallDy = -newBallDy;
      }

      // Bottom boundary (game over when missing ball)
      if (newBallY + dimensions.ballRadius > dimensions.canvasHeight) {
        setGameState("gameOver");
        return;
      }

      // Paddle collision
      if (
        newBallY + dimensions.ballRadius > paddle.y &&
        newBallY - dimensions.ballRadius < paddle.y + dimensions.paddleHeight &&
        newBallX > paddle.x &&
        newBallX < paddle.x + dimensions.paddleWidth
      ) {
        // Increase speed
        const newSpeedIncrease = speedIncrease + 0.025;
        setSpeedIncrease(newSpeedIncrease);
        const baseSpeed = dimensions.canvasWidth / 62.5; // Double the speed
        const newSpeed = baseSpeed + newSpeedIncrease;
        setBallSpeed(newSpeed);

        // Calculate new direction with increased speed
        const angle = Math.atan2(newBallDy, newBallDx);
        newBallDy = -Math.abs(Math.sin(angle) * newSpeed);

        // Add spin based on hit position
        const hitPos = (newBallX - paddle.x) / dimensions.paddleWidth;
        newBallDx = newSpeed * (hitPos - 0.5) * 2;

        createParticles(newBallX, paddle.y, "#0099CC");
      }

      // Check brick collisions
      let brickHit = false;
      const updatedBricks = bricks.map((brick) => {
        if (brick.hit) return brick;

        // Check collision
        if (
          checkBrickCollision(brick, newBallX, newBallY, dimensions.ballRadius)
        ) {
          if (!brickHit) {
            // Increase speed
            const newSpeedIncrease = speedIncrease + 0.025;
            setSpeedIncrease(newSpeedIncrease);
            const baseSpeed = dimensions.canvasWidth / 62.5; // Double the speed
            const newSpeed = baseSpeed + newSpeedIncrease;
            setBallSpeed(newSpeed);

            // Update ball direction with new speed
            const angle = Math.atan2(newBallDy, newBallDx);
            newBallDy =
              -Math.sign(newBallDy) * Math.abs(Math.sin(angle) * newSpeed);
            newBallDx =
              Math.sign(newBallDx) * Math.abs(Math.cos(angle) * newSpeed);

            brickHit = true;

            // Create particles
            createParticles(
              brick.x + dimensions.brickSize / 2,
              brick.y + dimensions.brickSize / 2,
              brick.color
            );

            // Update score
            setScore((prev) => prev + brick.points);

            // Create power-up
            if (brick.powerUp) {
              const powerUpType = brick.powerUp;
              setPowerUps((prev) => [
                ...prev,
                {
                  x: brick.x + dimensions.brickSize / 2,
                  y: brick.y + dimensions.brickSize / 2,
                  type: powerUpType,
                  dy: 1.5,
                },
              ]);
            }
          }

          return { ...brick, hit: true };
        }

        return brick;
      });

      setBricks(updatedBricks);
      setBall({ x: newBallX, y: newBallY, dx: newBallDx, dy: newBallDy });

      // Bricks are rendered as React components, not drawn on canvas

      // Draw simple solid ball
      ctx.fillStyle = "#0099CC"; // Darker cyan
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, dimensions.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw simple solid paddle
      ctx.fillStyle = "#CC00CC"; // Darker magenta
      ctx.fillRect(
        paddle.x,
        paddle.y,
        dimensions.paddleWidth,
        dimensions.paddleHeight
      );

      // Draw drag indicator when dragging
      if (isDragging) {
        ctx.strokeStyle = "#0099CC";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          paddle.x - 2,
          paddle.y - 2,
          dimensions.paddleWidth + 4,
          dimensions.paddleHeight + 4
        );
      }

      // Check win condition
      if (bricks.every((brick) => brick.hit)) {
        setGameState("won");
      }

      // Update and draw power-ups
      const activePowerUps = powerUps.filter((powerUp) => {
        powerUp.y += powerUp.dy;

        // Draw power-up
        ctx.fillStyle = "#CCCC00"; // Darker yellow
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw power-up symbol
        ctx.fillStyle = "#000000";
        ctx.font =
          '600 10px var(--font-wix), "Wix Madefor Display", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(powerUp.type[0].toUpperCase(), powerUp.x, powerUp.y);

        // Check paddle collision
        if (
          powerUp.y + 12 > paddle.y &&
          powerUp.y - 12 < paddle.y + dimensions.paddleHeight &&
          powerUp.x > paddle.x &&
          powerUp.x < paddle.x + dimensions.paddleWidth
        ) {
          // Apply power-up effect
          if (powerUp.type === "expand") {
            // Note: This would need to be handled differently with dynamic dimensions
            // For now, we'll skip the expand effect
          }
          createParticles(powerUp.x, powerUp.y, "#FFFF00");
          return false;
        }

        return powerUp.y < dimensions.canvasHeight;
      });
      setPowerUps(activePowerUps);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    gameState,
    ball,
    paddle,
    bricks,
    score,
    particles,
    powerUps,
    isDragging,
    ballSpeed,
    speedIncrease,
    dimensions,
  ]);

  // Initialize dimensions on mount
  useEffect(() => {
    calculateDimensions();
  }, [calculateDimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateDimensions]);

  // Initialize bricks when game starts or dimensions are ready
  useEffect(() => {
    if (
      dimensions.canvasWidth > 0 &&
      dimensions.canvasHeight > 0 &&
      gameState === "menu"
    ) {
      initializeBricks();
    }
  }, [dimensions.canvasWidth, dimensions.canvasHeight, gameState]);

  // Styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    userSelect: "none",
    position: "relative",
    width: "100%",
    height: "100%",
    fontFamily: 'var(--font-wix), "Wix Madefor Display", sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "4px",
    background: "linear-gradient(to right, #8478e0, #E19DED)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "none", // Hidden as we show title in GameClient
  };

  const subtitleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: "14px",
    display: "none", // Hidden as we show subtitle in GameClient
  };

  const canvasStyle: React.CSSProperties = {
    borderRadius: "16px",
    touchAction: "none",
    cursor:
      gameState === "playing" || gameState === "countdown" ? "grab" : "default",
    maxWidth: "100%",
    height: "auto",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    borderRadius: "8px",
    border: "1px solid #00FFFF",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 32px",
    background: "#0099CC",
    borderRadius: "4px",
    fontWeight: "600",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
  };

  const backButtonStyle: React.CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#CC0066",
    borderRadius: "4px",
    fontSize: "14px",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "600",
    textTransform: "uppercase",
    flexShrink: 0,
  };

  const statsContainerStyle: React.CSSProperties = {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: `${dimensions.canvasWidth}px`,
    padding: "16px 24px",
    backgroundColor: "#1a1a1a",
    borderRadius: "4px",
    border: "1px solid #0099CC",
  };

  const statsStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    fontSize: "14px",
    color: "#00FFFF",
    flexWrap: "nowrap",
    whiteSpace: "nowrap",
  };

  const statItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const shareButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#00FFFF",
    borderRadius: "4px",
    fontWeight: "600",
    border: "none",
    color: "#000000",
    cursor: "pointer",
    fontSize: "13px",
    margin: "0 2px",
    transition: "all 0.2s",
    textTransform: "uppercase",
  };

  const telegramButtonStyle: React.CSSProperties = {
    ...shareButtonStyle,
    backgroundColor: "#FF00FF",
  };

  const downloadButtonStyle: React.CSSProperties = {
    ...shareButtonStyle,
    backgroundColor: "#00FF00",
  };

  const shareContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  };

  const shareButtonsRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={titleStyle}>Bloom Protocol Arknoid</h1>
        <p style={subtitleStyle}>Play while we prepare something amazing!</p>
      </div>

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={dimensions.canvasWidth}
          height={dimensions.canvasHeight}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={canvasStyle}
        />

        {/* Render brick icons as overlays */}
        {(gameState === "playing" || gameState === "countdown") &&
          bricks.map(
            (brick, index) =>
              !brick.hit && (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: brick.x,
                    top: brick.y,
                    width: dimensions.brickSize,
                    height: dimensions.brickSize,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {brick.iconType === "token" ? (
                    <TokenIcon
                      symbol={brick.iconId}
                      variant="branded"
                      size={dimensions.brickSize - 4}
                    />
                  ) : brick.iconType === "exchange" ? (
                    <ExchangeIcon
                      id={brick.iconId}
                      variant="branded"
                      size={dimensions.brickSize - 4}
                    />
                  ) : (
                    <WalletIcon
                      id={brick.iconId}
                      variant="branded"
                      size={dimensions.brickSize - 4}
                    />
                  )}
                </div>
              )
          )}

        {gameState === "menu" && (
          <div style={overlayStyle}>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  color: "#00FFFF",
                  textTransform: "uppercase",
                }}
              >
                How to Play
              </h2>

              <div
                style={{
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#00FF00",
                  lineHeight: "1.6",
                }}
              >
                <p style={{ marginBottom: "8px" }}>
                  🪙 Break crypto icons for points!
                </p>
                <p style={{ fontSize: "12px", color: "#CCCC00" }}>
                  Drag paddle or use ← → keys • Speed increases each hit
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={startGame}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.backgroundColor = "#007AA3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "#0099CC";
                  }}
                >
                  Start Game
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  style={{...backButtonStyle, marginTop: '4px'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#990052";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#CC0066";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === "countdown" && (
          <div style={overlayStyle}>
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#00FFFF",
                  textTransform: "uppercase",
                }}
              >
                Get Ready!
              </h2>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "800",
                  color: "#00FF00",
                  animation: "pulse 1s infinite",
                }}
              >
                {countdownTime}
              </div>
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "#FF00FF",
                }}
              >
                Position your paddle!
              </p>
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div style={overlayStyle}>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#FF0080",
                  textTransform: "uppercase",
                }}
              >
                Game Over!
              </h2>
              <p
                style={{
                  fontSize: "18px",
                  marginBottom: "16px",
                  color: "#FFFF00",
                }}
              >
                Score:{" "}
                <span style={{ fontWeight: "800", color: "#00FFFF" }}>
                  {score}
                </span>
              </p>
              <button
                onClick={startGame}
                style={{ ...buttonStyle, background: "#FF00FF" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.backgroundColor = "#007AA3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "#0099CC";
                }}
              >
                Try Again
              </button>

              <div style={shareContainerStyle}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#00FFFF",
                    marginBottom: "8px",
                  }}
                >
                  Share your achievement
                </p>
                <div style={shareButtonsRowStyle}>
                  <button
                    onClick={downloadImage}
                    style={downloadButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.05) translateY(-2px)";
                      e.currentTarget.style.backgroundColor = "#00E6E6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1) translateY(0)";
                      e.currentTarget.style.backgroundColor = "#00FFFF";
                    }}
                  >
                    💾 Save Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === "won" && (
          <div style={overlayStyle}>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#00FF00",
                  textTransform: "uppercase",
                }}
              >
                You Won!
              </h2>
              <p
                style={{
                  fontSize: "18px",
                  marginBottom: "8px",
                  color: "#FFFF00",
                }}
              >
                Score:{" "}
                <span style={{ fontWeight: "800", color: "#00FFFF" }}>
                  {score}
                </span>
              </p>
              <p
                style={{
                  marginBottom: "16px",
                  color: "#FF00FF",
                  fontSize: "13px",
                }}
              >
                Amazing! You&apos;ve cleared all blocks!
              </p>
              <button
                onClick={startGame}
                style={{
                  ...buttonStyle,
                  background: "#00FF00",
                  color: "#000000",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "scale(1.05) translateY(-2px)";
                  e.currentTarget.style.backgroundColor = "#00E600";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) translateY(0)";
                  e.currentTarget.style.backgroundColor = "#00FF00";
                }}
              >
                Play Again
              </button>

              <div style={shareContainerStyle}>
                <p style={{ fontSize: "16px", color: "#00FFFF" }}>
                  Share your victory:
                </p>
                <div style={shareButtonsRowStyle}>
                  <button
                    onClick={downloadImage}
                    style={downloadButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.05) translateY(-2px)";
                      e.currentTarget.style.backgroundColor = "#00E6E6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1) translateY(0)";
                      e.currentTarget.style.backgroundColor = "#00FFFF";
                    }}
                  >
                    💾 Save Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={statsContainerStyle}>

        <div style={statsStyle}>
          <div style={statItemStyle}>
            <span style={{ color: "#00FFFF" }}>Score:</span>
            <span style={{ fontWeight: "800", color: "#FFFF00" }}>{score}</span>
          </div>
          <div style={statItemStyle}>
            <span style={{ color: "#00FFFF" }}>Speed:</span>
            <span style={{ fontWeight: "800", color: "#00FF00" }}>
              +{speedIncrease.toFixed(3)}
            </span>
          </div>
          <div style={statItemStyle}>
            <span style={{ color: "#00FFFF" }}>Time:</span>
            <span style={{ fontWeight: "800", color: "#FF00FF" }}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Hidden canvas for generating share images */}
      <canvas ref={shareCanvasRef} style={{ display: "none" }} />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default BloomArknoid;
