"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_WIDTH = 300;
const COLOR_THRESHOLD = 28;
const FEATHER_RANGE = 32;
const LOGO_WIDTH = 2356;
const LOGO_HEIGHT = 762;

function removeBackground(image, displayWidth, fillColor) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) {
    return null;
  }

  const ratio = displayWidth / sourceWidth;
  const scale = Math.min(4, (window.devicePixelRatio || 1) * 2);
  const width = Math.max(1, Math.round(displayWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * ratio * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  const background = [data[0], data[1], data[2]];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff = Math.max(
      Math.abs(r - background[0]),
      Math.abs(g - background[1]),
      Math.abs(b - background[2])
    );

    if (diff <= COLOR_THRESHOLD) {
      data[i + 3] = 0;
    } else if (diff <= COLOR_THRESHOLD + FEATHER_RANGE) {
      const ratio = (diff - COLOR_THRESHOLD) / FEATHER_RANGE;
      data[i + 3] = Math.round(data[i + 3] * ratio);
    }
  }

  context.putImageData(imageData, 0, 0);

  if (fillColor) {
    context.globalCompositeOperation = "source-in";
    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
  }

  return { dataUrl: canvas.toDataURL("image/png"), intrinsicWidth: width, intrinsicHeight: height };
}

function getPrimaryColor() {
  const styles = getComputedStyle(document.documentElement);
  const value = styles.getPropertyValue("--primary").trim();
  if (!value) {
    return "currentColor";
  }

  if (value.startsWith("hsl")) {
    return value;
  }

  if (/#|rgb|hsl/.test(value)) {
    return value;
  }

  return `hsl(${value})`;
}

export function FantaSpaceLogo({
  className = "",
  width = DEFAULT_WIDTH,
  alt = "Fanta Space logo",
}) {
  const [logoSrc, setLogoSrc] = useState(null);
  const [intrinsicSize, setIntrinsicSize] = useState(() => ({
    width,
    height: width * (LOGO_HEIGHT / LOGO_WIDTH),
  }));
  const imageRef = useRef(null);

  const height = useMemo(() => width * (LOGO_HEIGHT / LOGO_WIDTH), [width]);

  useEffect(() => {
    let mounted = true;

    const processLogo = () => {
      const image = imageRef.current;
      if (!mounted || !image || !image.naturalWidth) {
        return;
      }

      const color = getPrimaryColor();
      const result = removeBackground(image, width, color);
      if (result) {
        setLogoSrc(result.dataUrl);
        setIntrinsicSize({
          width: result.intrinsicWidth,
          height: result.intrinsicHeight,
        });
      }
    };

    if (!imageRef.current) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = processLogo;
      imageRef.current = img;
      img.src = "/fanta-space-logo.png";
      if (img.complete) {
        processLogo();
      }
    } else if (imageRef.current.complete) {
      processLogo();
    } else {
      imageRef.current.onload = processLogo;
    }

    const observer = new MutationObserver(processLogo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // process immediately in case no mutations occur
    processLogo();

    return () => {
      mounted = false;
      observer.disconnect();
      if (imageRef.current) {
        imageRef.current.onload = null;
      }
    };
  }, [width]);

  if (!logoSrc) {
    return (
      <span
        className={`block ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className || "inline-block"}
      style={{ width, height }}
      width={Math.round(intrinsicSize.width)}
      height={Math.round(intrinsicSize.height)}
    />
  );
}
