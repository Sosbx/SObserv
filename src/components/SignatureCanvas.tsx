import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'react-signature-canvas';

interface SignatureCanvasProps {
  width: number;
  height: number;
  onSave?: (signature: string) => void;
  initialSignature?: string | null;
  className?: string;
}

export interface SignatureCanvasRef {
  clear: () => void;
  getCanvas: () => HTMLCanvasElement;
  toData: () => any;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(({
  width,
  height,
  onSave,
  initialSignature,
  className
}, ref) => {
  const signaturePadRef = useRef<SignaturePad>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      signaturePadRef.current?.clear();
    },
    getCanvas: () => {
      return signaturePadRef.current?.getCanvas() as HTMLCanvasElement;
    },
    toData: () => {
      return signaturePadRef.current?.toData() || [];
    }
  }));

  useEffect(() => {
    if (initialSignature && signaturePadRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = signaturePadRef.current?.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calculer les dimensions pour centrer l'image
            const ratio = Math.min(
              (canvas.width * 0.8) / img.width,
              (canvas.height * 0.8) / img.height
            );
            const newWidth = img.width * ratio;
            const newHeight = img.height * ratio;
            const x = (canvas.width - newWidth) / 2;
            const y = (canvas.height - newHeight) / 2;
            
            ctx.drawImage(img, x, y, newWidth, newHeight);
          }
        }
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  // Ajuster le ratio du canvas pour éviter la distorsion
  useEffect(() => {
    const canvas = signaturePadRef.current?.getCanvas();
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [width, height]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%',
        height: '100%',
        maxWidth: width,
        maxHeight: height,
        margin: '0 auto'
      }}
    >
      <SignaturePad
        ref={signaturePadRef}
        canvasProps={{
          width,
          height,
          className: `border rounded-lg ${className || ''}`,
          style: {
            touchAction: 'none',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }
        }}
        dotSize={1}
        minWidth={1}
        maxWidth={2}
        throttle={16}
        backgroundColor="rgb(255, 255, 255)"
      />
    </div>
  );
});

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;