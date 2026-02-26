import Konva from "konva";
import type { SocialShareEngineResult, SocialShareGenerateParams } from "../types";
import { type WorkoutImageFormat } from "../../generateWorkoutImage";
import { iconLogo } from "../../../branding/logoConfig";
import { FORMAT_DIMENSIONS, ICON_PATHS, LAYOUT, formatDate } from "./constants";

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Return a transparent 1x1 pixel instead of failing
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      resolve(loadImage(canvas.toDataURL()));
    };
    img.src = src;
  });
};

/**
 * Konva engine implementation.
 * Faster and more reliable than DOM snapshots.
 */
export const generateWithKonvaEngine = async (
  params: SocialShareGenerateParams,
): Promise<SocialShareEngineResult> => {
  const { format, fileNameBase, scale, data } = params;
  if (!data) throw new Error("konva_engine_requires_data");

  // Wait for fonts to be ready
  if (typeof document !== "undefined" && "fonts" in document) {
    await (document as any).fonts.ready;
  }

  const { width, height } = FORMAT_DIMENSIONS[format];
  const { theme, stickers, logs } = data;

  const logoImg = await loadImage(iconLogo.src);
  const bgImg = theme.backgroundImage ? await loadImage(theme.backgroundImage) : null;

  // Create an off-screen container if needed (Konva works fine without attaching to DOM for export)
  const stage = new Konva.Stage({
    container: document.createElement("div"),
    width,
    height,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // 1. Background
  if (bgImg) {
    const bgImage = new Konva.Image({
      x: 0,
      y: 0,
      width,
      height,
      image: bgImg,
    });
    layer.add(bgImage);

    // Add a subtle overlay to ensure text readability if it's a light theme with an image
    layer.add(
      new Konva.Rect({
        width,
        height,
        fill: theme.isLight ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)",
        listening: false,
      }),
    );
  } else {
    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: width, y: height },
      fillLinearGradientColorStops: [
        0,
        theme.backgroundColor,
        1,
        theme.isLight ? "#f1f5f9" : "#000000",
      ],
    });
    layer.add(bgRect);
  }

  // 3. Header
  const { x: paddingX, y: paddingY } = LAYOUT.getPadding(format);

  layer.add(
    new Konva.Text({
      x: paddingX,
      y: paddingY,
      text: "RESUMEN DE SESIÓN",
      fontSize: 18,
      fontFamily: "Sora",
      fontWeight: "700",
      fill: theme.secondaryTextColor,
      letterSpacing: 2,
    }),
  );

  layer.add(
    new Konva.Text({
      x: paddingX,
      y: paddingY + 30,
      text: formatDate(data.date),
      fontSize: 52,
      fontFamily: "Sora",
      fontWeight: "900",
      fill: theme.primaryTextColor,
    }),
  );

  // TrendingUp Box
  const trendingBoxX = width - paddingX - 90;
  layer.add(
    new Konva.Rect({
      x: trendingBoxX,
      y: paddingY,
      width: 90,
      height: 90,
      cornerRadius: 28,
      fill: theme.accentColor + "26",
      stroke: theme.accentColor + "4D",
      strokeWidth: 1,
    }),
  );

  layer.add(
    new Konva.Path({
      x: trendingBoxX + 24,
      y: paddingY + 24,
      data: ICON_PATHS.trendingUp,
      stroke: theme.accentColor,
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round",
      scale: { x: 1.8, y: 1.8 },
    }),
  );

  // 4. Stats Grid
  const statsY = paddingY + 140;
  const { statsGap, cardHeight } = LAYOUT;
  const cardWidth = (width - paddingX * 2 - statsGap * 2) / 3;

  const stats = [
    { label: "Volumen", value: data.totalVolume, unit: "KG", icon: ICON_PATHS.zap },
    { label: "Ejercicios", value: data.totalExercises, unit: "EX", icon: ICON_PATHS.dumbbell },
    { label: "Reps", value: data.totalReps, unit: "TOT", icon: ICON_PATHS.target },
  ];

  stats.forEach((stat, i) => {
    const x = paddingX + i * (cardWidth + statsGap);

    layer.add(
      new Konva.Rect({
        x,
        y: statsY,
        width: cardWidth,
        height: cardHeight,
        cornerRadius: 32,
        fill: theme.backgroundImage
          ? theme.isLight
            ? "rgba(255,255,255,0.85)"
            : "rgba(0,0,0,0.6)"
          : theme.isLight
            ? "rgba(0,0,0,0.02)"
            : "rgba(255,255,255,0.02)",
        stroke: theme.backgroundImage
          ? theme.isLight
            ? "rgba(0,0,0,0.1)"
            : "rgba(255,255,255,0.1)"
          : theme.isLight
            ? "rgba(0,0,0,0.05)"
            : "rgba(255,255,255,0.05)",
        strokeWidth: 1,
        shadowBlur: theme.backgroundImage ? 10 : 0,
        shadowOpacity: 0.1,
      }),
    );

    layer.add(
      new Konva.Path({
        x: x + 25,
        y: statsY + 25,
        data: stat.icon,
        stroke: theme.accentColor,
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round",
        scale: { x: 0.8, y: 0.8 },
      }),
    );

    layer.add(
      new Konva.Text({
        x: x + 55,
        y: statsY + 26,
        text: stat.label.toUpperCase(),
        fontSize: 16,
        fontFamily: "Sora",
        fontWeight: "700",
        fill: theme.secondaryTextColor,
        letterSpacing: 1,
      }),
    );

    const valStr =
      stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value.toString();
    const valueText = new Konva.Text({
      x: x + 30,
      y: statsY + 60,
      text: valStr,
      fontSize: 62,
      fontFamily: "Sora",
      fontWeight: "900",
      fill: theme.primaryTextColor,
    });
    layer.add(valueText);

    layer.add(
      new Konva.Text({
        x: x + 35 + valueText.width(),
        y: statsY + 90,
        text: stat.unit,
        fontSize: 22,
        fontFamily: "Sora",
        fontWeight: "700",
        fill: theme.secondaryTextColor,
      }),
    );
  });

  // 5. Exercises List
  const exerciseLabelY = statsY + cardHeight + 50;
  layer.add(
    new Konva.Text({
      x: paddingX,
      y: exerciseLabelY,
      text: "PRINCIPALES EJERCICIOS",
      fontSize: 18,
      fontFamily: "Sora",
      fontWeight: "800",
      fill: theme.secondaryTextColor,
      letterSpacing: 1.5,
    }),
  );

  const exerciseYStart = exerciseLabelY + 35;
  const { itemHeight, itemGap } = LAYOUT;

  logs.slice(0, 8).forEach((log, i) => {
    const y = exerciseYStart + i * (itemHeight + itemGap);

    layer.add(
      new Konva.Rect({
        x: paddingX,
        y,
        width: width - paddingX * 2,
        height: itemHeight,
        cornerRadius: 20,
        fill: theme.backgroundImage
          ? theme.isLight
            ? "rgba(255,255,255,0.8)"
            : "rgba(0,0,0,0.5)"
          : theme.isLight
            ? "rgba(0,0,0,0.02)"
            : "rgba(255,255,255,0.02)",
        stroke: theme.backgroundImage
          ? theme.isLight
            ? "rgba(0,0,0,0.1)"
            : "rgba(255,255,255,0.1)"
          : theme.isLight
            ? "rgba(0,0,0,0.04)"
            : "rgba(255,255,255,0.04)",
        strokeWidth: 1,
      }),
    );

    // Icon background
    layer.add(
      new Konva.Rect({
        x: paddingX + 15,
        y: y + 15,
        width: 55,
        height: 55,
        cornerRadius: 12,
        fill: theme.accentColor + "1A",
      }),
    );

    layer.add(
      new Konva.Path({
        x: paddingX + 30,
        y: y + 30,
        data: ICON_PATHS.dumbbell,
        stroke: theme.accentColor,
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round",
        scale: { x: 1, y: 1 },
      }),
    );

    layer.add(
      new Konva.Text({
        x: paddingX + 85,
        y: y + 28,
        text: log.exercise,
        fontSize: 26,
        fontFamily: "Sora",
        fontWeight: "800",
        fill: theme.primaryTextColor,
        width: width - paddingX * 2 - 300,
        ellipsis: true,
        wrap: "none",
      }),
    );

    // Reps/Sets
    layer.add(
      new Konva.Text({
        x: width - paddingX - 220,
        y: y + 20,
        text: `${log.sets}×${log.reps}`,
        fontSize: 28,
        fontFamily: "Sora",
        fontWeight: "900",
        fill: theme.primaryTextColor,
        align: "right",
        width: 100,
      }),
    );
    layer.add(
      new Konva.Text({
        x: width - paddingX - 220,
        y: y + 52,
        text: "REPS",
        fontSize: 12,
        fontFamily: "Sora",
        fontWeight: "700",
        fill: theme.secondaryTextColor,
        align: "right",
        width: 100,
      }),
    );

    // Weight
    layer.add(
      new Konva.Text({
        x: width - paddingX - 100,
        y: y + 20,
        text: (log.weight ?? 0) > 0 ? `${log.weight}kg` : "BW",
        fontSize: 28,
        fontFamily: "Sora",
        fontWeight: "900",
        fill: theme.accentColor,
        align: "right",
        width: 90,
      }),
    );
    layer.add(
      new Konva.Text({
        x: width - paddingX - 100,
        y: y + 52,
        text: "PESO",
        fontSize: 12,
        fontFamily: "Sora",
        fontWeight: "700",
        fill: theme.secondaryTextColor,
        align: "right",
        width: 90,
      }),
    );
  });

  if (logs.length > 8) {
    const moreY = exerciseYStart + 8 * (itemHeight + itemGap) + 10;
    layer.add(
      new Konva.Text({
        x: paddingX,
        y: moreY,
        text: `+ ${logs.length - 8} ejercicios más en esta sesión`,
        fontSize: 18,
        fontFamily: "Sora",
        fontWeight: "600",
        fontStyle: "italic",
        fill: theme.secondaryTextColor,
        align: "center",
        width: width - paddingX * 2,
      }),
    );
  }

  // 6. Footer
  const footerY = height - paddingY - 80;

  layer.add(
    new Konva.Rect({
      x: paddingX,
      y: footerY,
      width: 140,
      height: 5,
      cornerRadius: 3,
      fill: theme.accentColor,
    }),
  );

  layer.add(
    new Konva.Text({
      x: paddingX,
      y: footerY + 15,
      text: "GENERADO POR FITTWIZ",
      fontSize: 14,
      fontFamily: "Sora",
      fontWeight: "700",
      fill: theme.secondaryTextColor,
      letterSpacing: 1,
    }),
  );

  layer.add(
    new Konva.Text({
      x: width - paddingX - 300,
      y: footerY - 10,
      text: "FITTWIZ",
      fontSize: 32,
      fontFamily: "Sora",
      fontWeight: "900",
      fontStyle: "italic",
      fill: theme.primaryTextColor,
      align: "right",
      width: 200,
    }),
  );

  layer.add(
    new Konva.Text({
      x: width - paddingX - 300,
      y: footerY + 25,
      text: "fittwiz.app",
      fontSize: 18,
      fontFamily: "Sora",
      fontWeight: "600",
      fill: theme.secondaryTextColor,
      align: "right",
      width: 200,
    }),
  );

  // Logo Icon
  const logoBoxSize = 56;
  layer.add(
    new Konva.Rect({
      x: width - paddingX - logoBoxSize,
      y: footerY - 10,
      width: logoBoxSize,
      height: logoBoxSize,
      cornerRadius: 16,
      fill: theme.isLight ? "#f1f5f9" : "#000",
      stroke: theme.isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
      strokeWidth: 2,
    }),
  );

  layer.add(
    new Konva.Image({
      x: width - paddingX - logoBoxSize + 7,
      y: footerY - 10 + 7,
      image: logoImg,
      width: logoBoxSize - 14,
      height: logoBoxSize - 14,
    }),
  );

  // 7. Stickers (Top layer)
  if (stickers && stickers.length > 0) {
    stickers.forEach((s) => {
      const stickerText = new Konva.Text({
        x: (s.x / 100) * width,
        y: (s.y / 100) * height,
        text: s.emoji,
        fontSize: 72,
        scaleX: s.scale,
        scaleY: s.scale,
        rotation: s.rotation,
        offsetX: 36, // center alignment manual fix
        offsetY: 36,
      });
      layer.add(stickerText);
    });
  }

  // Export
  layer.draw();
  const dataUrl = stage.toDataURL({ pixelRatio: scale });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${fileNameBase || "workout"}-${format}.png`, {
    type: "image/png",
  });

  return {
    engine: "konva",
    asset: {
      format,
      blob,
      file,
      dataUrl,
      width,
      height,
    },
  };
};
