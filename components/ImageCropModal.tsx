/**
 * ImageCropModal Component
 * 
 * Discord-style image cropping modal for avatars (circular) and banners (rectangular).
 * Uses Canvas API for cropping - no external dependencies.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropModalProps {
    image: string; // Base64 or URL of uploaded image
    aspectRatio: number; // 1 for avatar (circle), ~3 for banner
    cropShape: 'circle' | 'rectangle';
    onCrop: (croppedImage: string) => void;
    onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    image,
    aspectRatio,
    cropShape,
    onCrop,
    onCancel
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    // Crop area dimensions
    const CROP_SIZE = cropShape === 'circle' ? 200 : 280;
    const CROP_HEIGHT = cropShape === 'circle' ? CROP_SIZE : Math.round(CROP_SIZE / aspectRatio);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageRef.current = img;
            setImageLoaded(true);
            // Center the image initially
            setPosition({ x: 0, y: 0 });
        };
        img.src = image;
    }, [image]);

    // Handle mouse/touch drag
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Handle zoom
    const handleZoomChange = (newZoom: number) => {
        setZoom(Math.max(0.5, Math.min(3, newZoom)));
    };

    // Reset position and zoom
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    // Crop and export image
    const handleApply = () => {
        if (!imageRef.current || !containerRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Calculate the crop area in image coordinates
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;

        // Image dimensions as displayed
        const displayedWidth = img.naturalWidth * zoom;
        const displayedHeight = img.naturalHeight * zoom;

        // Image position relative to container center
        const imgLeft = containerCenterX - displayedWidth / 2 + position.x;
        const imgTop = containerCenterY - displayedHeight / 2 + position.y;

        // Crop area position (centered in container)
        const cropLeft = containerCenterX - CROP_SIZE / 2;
        const cropTop = containerCenterY - CROP_HEIGHT / 2;

        // Calculate what part of the original image is in the crop area
        const sourceX = (cropLeft - imgLeft) / zoom;
        const sourceY = (cropTop - imgTop) / zoom;
        const sourceWidth = CROP_SIZE / zoom;
        const sourceHeight = CROP_HEIGHT / zoom;

        // Set canvas size to output size - very small for hosting provider limits
        // Avatar: 64x64 (~2-4KB base64)
        // Banner: 200x~67 (~3-5KB base64)
        const outputSize = cropShape === 'circle' ? 64 : 200;
        const outputHeight = cropShape === 'circle' ? 64 : Math.round(200 / aspectRatio);
        canvas.width = outputSize;
        canvas.height = outputHeight;

        // For circular crops, clip to circle
        if (cropShape === 'circle') {
            ctx.beginPath();
            ctx.arc(outputSize / 2, outputHeight / 2, outputSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
        }

        // Draw the cropped portion
        ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, outputSize, outputHeight
        );

        // Export as JPEG with 0.5 quality for minimal file size (~2-5KB)
        const croppedImage = canvas.toDataURL('image/jpeg', 0.5);
        onCrop(croppedImage);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Edit Image</h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Crop Area */}
                <div
                    ref={containerRef}
                    className="relative w-full h-80 bg-slate-950 overflow-hidden cursor-move select-none"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* Image */}
                    {imageLoaded && imageRef.current && (
                        <img
                            src={image}
                            alt="Crop preview"
                            className="absolute pointer-events-none"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                maxWidth: 'none',
                                maxHeight: 'none'
                            }}
                            draggable={false}
                        />
                    )}

                    {/* Overlay with crop hole */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Dark overlay */}
                        <svg className="w-full h-full">
                            <defs>
                                <mask id="cropMask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {cropShape === 'circle' ? (
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r={CROP_SIZE / 2}
                                            fill="black"
                                        />
                                    ) : (
                                        <rect
                                            x={`calc(50% - ${CROP_SIZE / 2}px)`}
                                            y={`calc(50% - ${CROP_HEIGHT / 2}px)`}
                                            width={CROP_SIZE}
                                            height={CROP_HEIGHT}
                                            fill="black"
                                            rx="8"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill="rgba(0,0,0,0.7)"
                                mask="url(#cropMask)"
                            />
                        </svg>

                        {/* Crop border */}
                        {cropShape === 'circle' ? (
                            <div
                                className="absolute border-2 border-white/80 rounded-full"
                                style={{
                                    width: CROP_SIZE,
                                    height: CROP_SIZE,
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        ) : (
                            <div
                                className="absolute border-2 border-white/80 rounded-lg"
                                style={{
                                    width: CROP_SIZE,
                                    height: CROP_HEIGHT,
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-center gap-4 p-4 border-t border-slate-800">
                    <ZoomOut size={18} className="text-slate-400" />
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                        className="w-40 accent-primary-500"
                    />
                    <ZoomIn size={18} className="text-slate-400" />
                    <button
                        onClick={handleReset}
                        className="ml-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-4 border-t border-slate-800">
                    <button
                        onClick={handleReset}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                        Reset
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
