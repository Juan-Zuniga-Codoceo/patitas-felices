"use client";

import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

interface SortablePhotoProps {
    url: string;
    index: number;
    onRemove: (url: string) => void;
}

function SortablePhoto({ url, index, onRemove }: SortablePhotoProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group rounded-xl overflow-hidden border ${isDragging ? "border-[#5FAFE3] shadow-lg" : "border-gray-100"
                } aspect-square bg-gray-50 flex items-center justify-center`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <GripVertical className="w-4 h-4 text-gray-600" />
            </div>

            <img
                src={url}
                alt={`Image ${index}`}
                className="w-full h-full object-cover pointer-events-none"
            />

            {index === 0 && (
                <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#5FAFE3] text-white px-2 py-1 rounded-md shadow-sm z-10 pointer-events-none">
                    Principal
                </span>
            )}

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(url);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-red-600 z-10"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

interface SortableImageGalleryProps {
    images: string[];
    onImagesChange: (newImages: string[]) => void;
}

export function SortableImageGallery({ images, onImagesChange }: SortableImageGalleryProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires a 5px movement to start drag, allowing clicks to pass through
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);
            onImagesChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    if (images.length === 0) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={images} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {images.map((url, index) => (
                        <SortablePhoto
                            key={url} // URL as unique ID for sortable context
                            url={url}
                            index={index}
                            onRemove={(urlToRemove) => {
                                onImagesChange(images.filter((img) => img !== urlToRemove));
                            }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
