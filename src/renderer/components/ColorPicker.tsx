import React, { useState, useEffect } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  onClose: () => void;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const COLOR_PRESETS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84',
  '#6C5B7B', '#355C7D', '#2A9D8F', '#E76F51', '#F4A261',
  '#E63946', '#1D3557', '#457B9D', '#A8DADC', '#F1FAEE',
];

const ColorPicker: React.FC<ColorPickerProps> = ({ onClose }) => {
  const [rgb, setRgb] = useState<RGB>({ r: 66, g: 135, b: 245 });
  const [hex, setHex] = useState('#4287F5');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    const newHex = rgbToHex(rgb);
    setHex(newHex);
  }, [rgb]);

  const rgbToHex = (rgb: RGB): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
  };

  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHsl = (rgb: RGB): { h: number; s: number; l: number } => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const updateFromHex = (hexValue: string) => {
    const newRgb = hexToRgb(hexValue);
    if (newRgb) {
      setRgb(newRgb);
      setHex(hexValue.toUpperCase());
    }
  };

  const updateRgbComponent = (component: keyof RGB, value: number) => {
    setRgb({ ...rgb, [component]: Math.max(0, Math.min(255, value)) });
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hsl = rgbToHsl(rgb);
  const currentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const formats = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSLA', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
  ];

  return (
    <div className="color-picker-panel">
      <div className="color-picker-header">
        <h3>Color Picker</h3>
        <button className="todo-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="color-picker-content">
        {/* Color Display */}
        <div className="color-display" style={{ backgroundColor: currentColor }}>
          <div className="color-display-value">{hex}</div>
        </div>

        {/* Input Controls */}
        <div className="color-inputs-section">
          <h4>Color Input</h4>
          <div className="color-input-group">
            <span className="color-input-label">HEX</span>
            <input
              type="text"
              className="color-input-field"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              placeholder="#000000"
            />
            <input
              type="color"
              className="color-native-picker"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
            />
          </div>
        </div>

        {/* RGB Sliders */}
        <div className="color-sliders">
          <div className="color-slider-group">
            <div className="color-slider-label">
              <span className="color-slider-name">Red</span>
              <span className="color-slider-value">{rgb.r}</span>
            </div>
            <input
              type="range"
              className="color-slider"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => updateRgbComponent('r', parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`,
              }}
            />
          </div>

          <div className="color-slider-group">
            <div className="color-slider-label">
              <span className="color-slider-name">Green</span>
              <span className="color-slider-value">{rgb.g}</span>
            </div>
            <input
              type="range"
              className="color-slider"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => updateRgbComponent('g', parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`,
              }}
            />
          </div>

          <div className="color-slider-group">
            <div className="color-slider-label">
              <span className="color-slider-name">Blue</span>
              <span className="color-slider-value">{rgb.b}</span>
            </div>
            <input
              type="range"
              className="color-slider"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => updateRgbComponent('b', parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`,
              }}
            />
          </div>
        </div>

        {/* Color Formats */}
        <div className="color-formats">
          <h4>Color Formats</h4>
          {formats.map((format) => (
            <div key={format.label} className="color-format-item">
              <span className="color-format-label">{format.label}</span>
              <span className="color-format-value">{format.value}</span>
              <button
                className={`color-copy-btn ${copiedFormat === format.label ? 'copied' : ''}`}
                onClick={() => copyToClipboard(format.value, format.label)}
              >
                {copiedFormat === format.label ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

        {/* Color Presets */}
        <div className="color-presets">
          <h4>Color Presets</h4>
          <div className="color-preset-grid">
            {COLOR_PRESETS.map((color, index) => (
              <div
                key={index}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => updateFromHex(color)}
              >
                <div className="color-preset-tooltip">{color}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
