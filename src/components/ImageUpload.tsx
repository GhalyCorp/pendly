'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setIsUploading(true);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          alert('Please upload only image files.');
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB.');
          continue;
        }
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });

        newImages.push(imageUrl);
      }

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
              const newImages: string[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          if (!file.type.startsWith('image/')) {
            alert('Please upload only image files.');
            continue;
          }

          if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            continue;
          }
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          newImages.push(imageUrl);
          
          if (newImages.length === files.length) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Campaign Images</h3>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isUploading 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isUploading ? 'Uploading...' : 'Add Images to Your Campaign'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Choose Images'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image}
                  alt={`Campaign image ${index + 1}`}
                  fill
                  className="object-cover bg-gray-200"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove image"
                >
                  ×
                </button>
                
                {/* Image number */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for great campaign images:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality images that represent your business or cause</li>
          <li>• Include photos of your products, team, or the impact you&apos;re making</li>
          <li>• Keep file sizes under 5MB for faster loading</li>
          <li>• First image will be the main preview in campaign listings</li>
        </ul>
      </div>
    </div>
  );
} 