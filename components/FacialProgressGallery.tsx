"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { RefreshCw } from "lucide-react";

type ProgressPhoto = {
  id: string;
  photo_url: string;
  timestamp: string;
  lighting_score: number | null;
  alignment_score: number | null;
};

const FacialProgressGallery = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [comparisonPhoto, setComparisonPhoto] = useState<ProgressPhoto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Simple non-reactive fetch function
  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/facial-progress');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.photos && Array.isArray(data.photos)) {
        setPhotos(data.photos);
        
        // Update selected and comparison photos if they exist
        if (selectedPhoto) {
          const updatedSelectedPhoto = data.photos.find((p: ProgressPhoto) => p.id === selectedPhoto.id);
          if (updatedSelectedPhoto) {
            setSelectedPhoto(updatedSelectedPhoto);
          }
        }
        
        if (comparisonPhoto) {
          const updatedComparisonPhoto = data.photos.find((p: ProgressPhoto) => p.id === comparisonPhoto.id);
          if (updatedComparisonPhoto) {
            setComparisonPhoto(updatedComparisonPhoto);
          }
        }
        
        // Auto-select the most recent photo if no photo is selected
        if (!selectedPhoto && data.photos.length > 0) {
          setSelectedPhoto(data.photos[0]);
        }
      } else {
        setPhotos([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load progress photos');
    }
  };
  
  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await fetchPhotos();
      setIsLoading(false);
    };
    
    initialLoad();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent duplicate refreshes
    
    setIsRefreshing(true);
    await fetchPhotos();
    setIsRefreshing(false);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const handleSelectPhoto = (photo: ProgressPhoto) => {
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      // If clicking on the already selected photo, deselect it
      setSelectedPhoto(null);
    } else if (comparisonPhoto && comparisonPhoto.id === photo.id) {
      // If clicking on the comparison photo, deselect it
      setComparisonPhoto(null);
    } else if (!selectedPhoto) {
      // If no photo is selected, select this one
      setSelectedPhoto(photo);
    } else {
      // If a photo is already selected, set this as the comparison
      setComparisonPhoto(photo);
    }
  };
  
  const clearSelection = () => {
    setSelectedPhoto(null);
    setComparisonPhoto(null);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-6 text-destructive">
        <p>{error}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-600">
        <p>No progress photos yet.</p>
        <p className="text-sm mt-2">Take your first photo to start tracking your progress.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Main display area */}
      <div className="flex space-x-2 mb-4">
        {/* Selected Photo */}
        <div className="flex-1">
          {selectedPhoto ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="relative pb-[125%]">
                <img 
                  src={selectedPhoto.photo_url} 
                  alt={`Progress photo from ${formatDate(selectedPhoto.timestamp)}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-2 text-xs text-center bg-neutral-100">
                {formatDate(selectedPhoto.timestamp)}
              </div>
            </div>
          ) : (
            <div className="border rounded-lg flex items-center justify-center h-40 bg-neutral-100 text-neutral-600 text-sm">
              Select a photo
            </div>
          )}
        </div>
        
        {/* Comparison Photo */}
        <div className="flex-1">
          {comparisonPhoto ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="relative pb-[125%]">
                <img 
                  src={comparisonPhoto.photo_url} 
                  alt={`Progress photo from ${formatDate(comparisonPhoto.timestamp)}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-2 text-xs text-center bg-neutral-100">
                {formatDate(comparisonPhoto.timestamp)}
              </div>
            </div>
          ) : (
            <div className="border rounded-lg flex items-center justify-center h-40 bg-neutral-100 text-neutral-600 text-sm">
              {selectedPhoto ? 'Select comparison' : 'Select primary photo first'}
            </div>
          )}
        </div>
      </div>
      
      {/* Photo thumbnails grid */}
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => handleSelectPhoto(photo)}
              className={`
                relative rounded-md overflow-hidden border-2 focus:outline-none
                ${selectedPhoto?.id === photo.id ? 'border-neutral-800' : 
                  comparisonPhoto?.id === photo.id ? 'border-neutral-600' : 'border-transparent'}
              `}
            >
              <div className="relative pb-[100%]">
                <img 
                  src={photo.photo_url} 
                  alt={`Progress photo from ${formatDate(photo.timestamp)}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {formatDate(photo.timestamp)}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Refresh button */}
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isRefreshing ? 'Refreshing...' : 'Refresh Photos'}
        </Button>
        
        {(selectedPhoto || comparisonPhoto) && (
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
};

export default FacialProgressGallery; 