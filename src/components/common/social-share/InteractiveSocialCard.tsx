import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Path, Image, Transformer, Group } from "react-konva";
import {
  WorkoutImageFormat,
  FORMAT_DIMENSIONS,
  ICON_PATHS,
  LAYOUT,
} from "../../../utils/social-share/engines/constants";
import { iconLogo } from "../../../branding/logoConfig";
import { type StickerData, type SocialShareData } from "../../../utils/social-share/types";
import Konva from "konva";

interface InteractiveSocialCardProps {
  data: SocialShareData;
  format: WorkoutImageFormat;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStickersChange: (stickers: StickerData[]) => void;
  onRemove: (id: string) => void;
}

export const InteractiveSocialCard: React.FC<InteractiveSocialCardProps> = ({
  data,
  format,
  selectedId,
  onSelect,
  onStickersChange,
  onRemove,
}) => {
  const { width, height } = FORMAT_DIMENSIONS[format];
  const { theme, logs } = data;
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stickerRefs = useRef<Map<string, Konva.Text>>(new Map());

  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width: containerWidth } = containerRef.current.getBoundingClientRect();
        if (containerWidth > 0) {
          setStageScale(containerWidth / width);
        }
      }
    };

    // Initial check + slight delay for modal animation
    handleResize();
    const timer = setTimeout(handleResize, 100);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [width]);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = iconLogo.src;
    img.onload = () => setLogoImg(img);

    if (theme.backgroundImage) {
      const bImg = new window.Image();
      bImg.crossOrigin = "Anonymous";
      bImg.src = theme.backgroundImage;
      bImg.onload = () => setBgImg(bImg);
    } else {
      setBgImg(null);
    }

    if ("fonts" in document) {
      (document as any).fonts.ready.then(() => setFontsReady(true));
      // Fallback if fonts take too long
      setTimeout(() => setFontsReady(true), 2000);
    } else {
      setFontsReady(true);
    }
  }, [theme.backgroundImage, iconLogo.src]);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stickerRefs.current.get(selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, data.stickers]);

  const { x: paddingX, y: paddingY } = LAYOUT.getPadding(format);
  const statsY = paddingY + 140;
  const { statsGap, cardHeight, itemHeight, itemGap } = LAYOUT;
  const cardWidth = (width - paddingX * 2 - statsGap * 2) / 3;

  const stats = [
    { label: "Volumen", value: data.totalVolume, unit: "KG", icon: ICON_PATHS.zap },
    { label: "Ejercicios", value: data.totalExercises, unit: "EX", icon: ICON_PATHS.dumbbell },
    { label: "Reps", value: data.totalReps, unit: "TOT", icon: ICON_PATHS.target },
  ];

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Sencilla verificación: si pulsamos el fondo (Stage), deseleccionamos
    if (e.target === e.target.getStage()) {
      onSelect(null);
    }
  };

  const updateSticker = (id: string, updates: Partial<StickerData>) => {
    onStickersChange(data.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  if (!fontsReady) return null;

  return (
    <div
      ref={containerRef}
      className='w-full h-full flex items-center justify-center overflow-hidden'
    >
      <Stage
        width={width * stageScale}
        height={height * stageScale}
        ref={stageRef}
        scaleX={stageScale}
        scaleY={stageScale}
        onClick={handleStageClick}
        onTap={(e: any) => handleStageClick(e)}
        style={{
          background: theme.backgroundColor,
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          opacity: fontsReady ? 1 : 0.5,
          transition: "opacity 0.3s ease",
        }}
      >
        <Layer>
          {/* Background */}
          {bgImg ? (
            <Group listening={false}>
              <Image
                image={bgImg}
                width={width}
                height={height}
              />
              <Rect
                width={width}
                height={height}
                fill={theme.isLight ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)"}
              />
            </Group>
          ) : (
            <Rect
              width={width}
              height={height}
              listening={false}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: width, y: height }}
              fillLinearGradientColorStops={[
                0,
                theme.backgroundColor,
                1,
                theme.isLight ? "#f1f5f9" : "#000000",
              ]}
            />
          )}

          {/* Header */}
          <Text
            x={paddingX}
            y={paddingY}
            text={data.routineTitle ? data.date : "RESUMEN DE SESIÓN"}
            fontSize={18}
            fontFamily='Sora'
            fontWeight='700'
            fill={theme.secondaryTextColor}
            letterSpacing={2}
          />
          <Text
            x={paddingX}
            y={paddingY + 30}
            text={data.routineTitle || data.date}
            fontSize={52}
            fontFamily='Sora'
            fontWeight='900'
            fill={theme.primaryTextColor}
          />

          {/* Trending Box */}
          <Group
            x={width - paddingX - 90}
            y={paddingY}
          >
            <Rect
              width={90}
              height={90}
              cornerRadius={28}
              fill={theme.accentColor + "26"}
              stroke={theme.accentColor + "4D"}
              strokeWidth={1}
            />
            <Path
              x={24}
              y={24}
              data={ICON_PATHS.trendingUp}
              stroke={theme.accentColor}
              strokeWidth={3}
              lineCap='round'
              lineJoin='round'
              scale={{ x: 1.8, y: 1.8 }}
            />
          </Group>

          {/* Stats Grid */}
          {stats.map((stat, i) => {
            const x = paddingX + i * (cardWidth + statsGap);
            const valStr =
              stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value.toString();

            return (
              <Group
                key={i}
                x={x}
                y={statsY}
              >
                <Rect
                  width={cardWidth}
                  height={cardHeight}
                  cornerRadius={32}
                  fill={
                    theme.backgroundImage
                      ? theme.isLight
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(0,0,0,0.6)"
                      : theme.isLight
                        ? "rgba(0,0,0,0.02)"
                        : "rgba(255,255,255,0.02)"
                  }
                  stroke={
                    theme.backgroundImage
                      ? theme.isLight
                        ? "rgba(0,0,0,0.1)"
                        : "rgba(255,255,255,0.1)"
                      : theme.isLight
                        ? "rgba(0,0,0,0.05)"
                        : "rgba(255,255,255,0.05)"
                  }
                  strokeWidth={1}
                  shadowBlur={theme.backgroundImage ? 10 : 0}
                  shadowOpacity={0.1}
                />
                <Path
                  x={25}
                  y={25}
                  data={stat.icon}
                  stroke={theme.accentColor}
                  strokeWidth={2}
                  lineCap='round'
                  lineJoin='round'
                  scale={{ x: 0.8, y: 0.8 }}
                />
                <Text
                  x={55}
                  y={26}
                  text={stat.label.toUpperCase()}
                  fontSize={16}
                  fontFamily='Sora'
                  fontWeight='700'
                  fill={theme.secondaryTextColor}
                  letterSpacing={1}
                />
                <Text
                  x={30}
                  y={60}
                  text={valStr}
                  fontSize={62}
                  fontFamily='Sora'
                  fontWeight='900'
                  fill={theme.primaryTextColor}
                />
              </Group>
            );
          })}

          {/* Exercises */}
          <Text
            x={paddingX}
            y={statsY + cardHeight + 50}
            text='PRINCIPALES EJERCICIOS'
            fontSize={18}
            fontFamily='Sora'
            fontWeight='800'
            fill={theme.secondaryTextColor}
            letterSpacing={1.5}
          />

          <Group
            x={paddingX}
            y={statsY + cardHeight + 85}
          >
            {logs.slice(0, 8).map((log, i) => {
              const y = i * (itemHeight + itemGap);
              return (
                <Group
                  key={i}
                  y={y}
                >
                  <Rect
                    width={width - paddingX * 2}
                    height={itemHeight}
                    cornerRadius={20}
                    fill={
                      theme.backgroundImage
                        ? theme.isLight
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(0,0,0,0.5)"
                        : theme.isLight
                          ? "rgba(0,0,0,0.02)"
                          : "rgba(255,255,255,0.02)"
                    }
                    stroke={
                      theme.backgroundImage
                        ? theme.isLight
                          ? "rgba(0,0,0,0.1)"
                          : "rgba(255,255,255,0.1)"
                        : theme.isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.04)"
                    }
                    strokeWidth={1}
                  />
                  <Rect
                    x={15}
                    y={15}
                    width={55}
                    height={55}
                    cornerRadius={12}
                    fill={theme.accentColor + "1A"}
                  />
                  <Path
                    x={30}
                    y={30}
                    data={ICON_PATHS.dumbbell}
                    stroke={theme.accentColor}
                    strokeWidth={2}
                    lineCap='round'
                    lineJoin='round'
                  />

                  <Text
                    x={85}
                    y={28}
                    text={log.exercise}
                    fontSize={26}
                    fontFamily='Sora'
                    fontWeight='800'
                    fill={theme.primaryTextColor}
                    width={width - paddingX * 2 - 300}
                    ellipsis={true}
                    wrap='none'
                  />
                  <Text
                    x={width - paddingX * 2 - 220}
                    y={20}
                    text={`${log.sets}×${log.reps}`}
                    fontSize={28}
                    fontFamily='Sora'
                    fontWeight='900'
                    fill={theme.primaryTextColor}
                    align='right'
                    width={100}
                  />
                  <Text
                    x={width - paddingX * 2 - 100}
                    y={20}
                    text={(log.weight ?? 0) > 0 ? `${log.weight}kg` : "BW"}
                    fontSize={28}
                    fontFamily='Sora'
                    fontWeight='900'
                    fill={theme.accentColor}
                    align='right'
                    width={90}
                  />
                </Group>
              );
            })}
          </Group>

          {/* Footer */}
          <Group
            x={paddingX}
            y={height - paddingY - 80}
          >
            <Rect
              width={140}
              height={5}
              cornerRadius={3}
              fill={theme.accentColor}
            />
            <Text
              y={15}
              text='GENERADO POR FITTWIZ'
              fontSize={14}
              fontFamily='Sora'
              fontWeight='700'
              fill={theme.secondaryTextColor}
              letterSpacing={1}
            />

            <Text
              x={width - paddingX * 2 - 300}
              y={-10}
              text='FITTWIZ'
              fontSize={32}
              fontFamily='Sora'
              fontWeight='900'
              fontStyle='italic'
              fill={theme.primaryTextColor}
              align='right'
              width={200}
            />
            <Text
              x={width - paddingX * 2 - 300}
              y={25}
              text='fittwiz.app'
              fontSize={18}
              fontFamily='Sora'
              fontWeight='600'
              fill={theme.secondaryTextColor}
              align='right'
              width={200}
            />

            {/* Logo */}
            <Group
              x={width - paddingX * 2 - 56}
              y={-10}
            >
              <Rect
                width={56}
                height={56}
                cornerRadius={16}
                fill={theme.isLight ? "#f1f5f9" : "#000"}
                stroke={theme.isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"}
                strokeWidth={2}
              />
              {logoImg && (
                <Image
                  image={logoImg}
                  x={7}
                  y={7}
                  width={42}
                  height={42}
                />
              )}
            </Group>
          </Group>

          {/* 7. Stickers */}
          {data.stickers.map((s) => (
            <Text
              key={s.id}
              ref={(el) => {
                if (el) stickerRefs.current.set(s.id, el as Konva.Text);
                else stickerRefs.current.delete(s.id);
              }}
              x={(s.x / 100) * width}
              y={(s.y / 100) * height}
              text={s.emoji}
              fontSize={72}
              scaleX={s.scale}
              scaleY={s.scale}
              rotation={s.rotation}
              draggable
              offsetX={36}
              offsetY={36}
              hitStrokeWidth={70}
              onDragEnd={(e) => {
                const node = e.target;
                updateSticker(s.id, {
                  x: (node.x() / width) * 100,
                  y: (node.y() / height) * 100,
                });
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                updateSticker(s.id, {
                  scale: node.scaleX(),
                  rotation: node.rotation(),
                  x: (node.x() / width) * 100,
                  y: (node.y() / height) * 100,
                });
              }}
              onClick={() => onSelect(s.id)}
              onTap={() => onSelect(s.id)}
            />
          ))}

          {selectedId && (
            <Group>
              <Transformer
                ref={transformerRef}
                keepRatio={true}
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                anchorSize={25}
                anchorCornerRadius={12}
                anchorStroke='#3b82f6'
                anchorFill='#ffffff'
                borderStroke='#3b82f6'
                borderStrokeWidth={2}
              />
              {/* Delete Button (X) */}
              {(() => {
                const node = stickerRefs.current.get(selectedId);
                if (!node) return null;
                const box = node.getClientRect();
                // Position relative to stage, then unscale
                const x = (box.x + box.width) / stageScale;
                const y = box.y / stageScale;

                return (
                  <Group
                    x={x}
                    y={y}
                    onClick={() => onRemove(selectedId)}
                    onTap={() => onRemove(selectedId)}
                  >
                    <Rect
                      width={34}
                      height={34}
                      fill='#ef4444'
                      cornerRadius={17}
                      shadowBlur={10}
                      shadowOpacity={0.3}
                    />
                    <Path
                      data='M18 6L6 18M6 6l12 12'
                      stroke='white'
                      strokeWidth={2.5}
                      lineCap='round'
                      lineJoin='round'
                      x={8}
                      y={8}
                    />
                  </Group>
                );
              })()}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};
