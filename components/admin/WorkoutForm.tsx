"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FocusArea, Movement, Workout } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { X, Plus, GripVertical, Check, AlertCircle } from 'lucide-react';

interface WorkoutFormProps {
  focusAreas: FocusArea[];
  movements: Movement[];
  workoutData?: Workout;
  workoutMovements?: Array<{
    movement: Movement;
    sequence_order: number;
    duration_seconds: number | null;
    repetitions: number | null;
    sets: number | null;
  }>;
  workoutFocusAreas?: FocusArea[];
  isEditing?: boolean;
}

export function WorkoutForm({
  focusAreas,
  movements,
  workoutData,
  workoutMovements = [],
  workoutFocusAreas = [],
  isEditing = false
}: WorkoutFormProps) {
  const router = useRouter();
  
  // Base workout data
  const [title, setTitle] = useState(workoutData?.title || '');
  const [description, setDescription] = useState(workoutData?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(workoutData?.duration_minutes?.toString() || '');
  const [intensity, setIntensity] = useState<'beginner' | 'intermediate' | 'advanced'>(
    (workoutData?.intensity as 'beginner' | 'intermediate' | 'advanced') || 'beginner'
  );
  const [videoUrl, setVideoUrl] = useState(workoutData?.video_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(workoutData?.thumbnail_url || '');
  const [coachNote, setCoachNote] = useState(workoutData?.coach_note || '');
  const [isActive, setIsActive] = useState(workoutData?.is_active !== false);
  
  // Selected focus areas
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(
    workoutFocusAreas.map(fa => fa.id) || []
  );
  
  // Workout movements sequence
  const [workoutMovementsList, setWorkoutMovementsList] = useState(
    workoutMovements.map(wm => ({
      id: `${wm.movement.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      movement_id: wm.movement.id,
      movement_name: wm.movement.name,
      sequence_order: wm.sequence_order,
      duration_seconds: wm.duration_seconds?.toString() || '',
      repetitions: wm.repetitions?.toString() || '',
      sets: wm.sets?.toString() || ''
    })) || []
  );
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Add a new movement to the sequence
  const addMovement = () => {
    setWorkoutMovementsList(prev => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        movement_id: '',
        movement_name: '',
        sequence_order: prev.length + 1,
        duration_seconds: '',
        repetitions: '',
        sets: ''
      }
    ]);
  };
  
  // Remove a movement from the sequence
  const removeMovement = (index: number) => {
    setWorkoutMovementsList(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      
      // Update sequence order for remaining items
      return newList.map((item, idx) => ({
        ...item,
        sequence_order: idx + 1
      }));
    });
  };
  
  // Update movement data
  const updateMovement = (index: number, field: string, value: string) => {
    setWorkoutMovementsList(prev => {
      const newList = [...prev];
      
      if (field === 'movement_id' && value) {
        const selectedMovement = movements.find(m => m.id === value);
        if (selectedMovement) {
          newList[index].movement_name = selectedMovement.name;
        }
      }
      
      // @ts-ignore
      newList[index][field] = value;
      return newList;
    });
  };
  
  // Handle reordering of movements
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination) return;
    if (destination.index === source.index) return;
    
    setWorkoutMovementsList(prev => {
      const newList = [...prev];
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      
      // Update sequence order for all items
      return newList.map((item, idx) => ({
        ...item,
        sequence_order: idx + 1
      }));
    });
  };
  
  // Toggle focus area selection
  const toggleFocusArea = (focusAreaId: string) => {
    setSelectedFocusAreas(prev => {
      if (prev.includes(focusAreaId)) {
        return prev.filter(id => id !== focusAreaId);
      } else {
        return [...prev, focusAreaId];
      }
    });
  };
  
  // Form validation
  const validateForm = (): boolean => {
    if (!title) {
      setError('Title is required');
      return false;
    }
    
    if (!durationMinutes || isNaN(Number(durationMinutes))) {
      setError('Duration must be a valid number');
      return false;
    }
    
    if (selectedFocusAreas.length === 0) {
      setError('Select at least one focus area');
      return false;
    }
    
    if (workoutMovementsList.length === 0) {
      setError('Add at least one movement');
      return false;
    }
    
    for (const movement of workoutMovementsList) {
      if (!movement.movement_id) {
        setError('All movements must have a selected exercise');
        return false;
      }
    }
    
    return true;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const workoutPayload: Partial<Workout> = {
        title,
        description: description || null,
        duration_minutes: Number(durationMinutes),
        intensity: intensity,
        video_url: videoUrl || null,
        thumbnail_url: thumbnailUrl || null,
        coach_note: coachNote || null,
        is_active: isActive
      };
      
      const movementsPayload = workoutMovementsList.map(m => ({
        movement_id: m.movement_id,
        sequence_order: m.sequence_order,
        duration_seconds: m.duration_seconds ? Number(m.duration_seconds) : null,
        repetitions: m.repetitions ? Number(m.repetitions) : null,
        sets: m.sets ? Number(m.sets) : null
      }));
      
      // Use the API endpoint instead of the direct function call
      const response = await fetch('/api/admin/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          workoutData: workoutPayload,
          movementsData: movementsPayload,
          focusAreaIds: selectedFocusAreas,
          workoutId: isEditing ? workoutData?.id : undefined
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(true);
        
        // Invalidate browser cache before redirecting
        if (typeof window !== 'undefined' && window.caches && 'delete' in window.caches) {
          try {
            // Attempt to clear the cache API cache
            console.log('Attempting to clear browser cache');
            const cachesToClear = await window.caches.keys();
            await Promise.all(cachesToClear.map(cache => window.caches.delete(cache)));
          } catch (err) {
            console.error('Error clearing cache:', err);
          }
        }
        
        // Redirect after successful submission
        setTimeout(() => {
          router.push('/admin/workouts');
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'Failed to save workout');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // In the component body, add a useEffect to reset state when props change
  useEffect(() => {
    // Skip the effect in create mode (when workoutData doesn't exist)
    if (!workoutData || !isEditing) return;
    
    console.log('WorkoutForm received new props, updating state');
    
    // Reset state based on props
    setTitle(workoutData?.title || '');
    setDescription(workoutData?.description || '');
    setDurationMinutes(workoutData?.duration_minutes?.toString() || '');
    setIntensity((workoutData?.intensity as 'beginner' | 'intermediate' | 'advanced') || 'beginner');
    setVideoUrl(workoutData?.video_url || '');
    setThumbnailUrl(workoutData?.thumbnail_url || '');
    setCoachNote(workoutData?.coach_note || '');
    setIsActive(workoutData?.is_active !== false);
    
    // Reset focus areas
    setSelectedFocusAreas(workoutFocusAreas.map(fa => fa.id) || []);
    
    // Reset workout movements list
    setWorkoutMovementsList(
      workoutMovements.map(wm => ({
        id: `${wm.movement.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        movement_id: wm.movement.id,
        movement_name: wm.movement.name,
        sequence_order: wm.sequence_order,
        duration_seconds: wm.duration_seconds?.toString() || '',
        repetitions: wm.repetitions?.toString() || '',
        sets: wm.sets?.toString() || ''
      })) || []
    );
    
  }, [workoutData, workoutMovements, workoutFocusAreas, isEditing]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      {/* Basic Workout Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Workout Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Facial Refresher"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the workout, its benefits, etc."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)*</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g., 15"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="intensity">Intensity Level*</Label>
                <Select value={intensity} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setIntensity(value)}>
                  <SelectTrigger id="intensity">
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                value={videoUrl || ''}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g., https://example.com/video.mp4"
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={thumbnailUrl || ''}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="e.g., https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="coach_note">Coach Note</Label>
              <Textarea
                id="coach_note"
                value={coachNote || ''}
                onChange={(e) => setCoachNote(e.target.value)}
                placeholder="Add any special instructions or notes from the coach"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_active" className="font-normal">Active workout (visible to users)</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Focus Areas */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Focus Areas*</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Select the areas this workout focuses on
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {focusAreas.map((area) => (
              <div
                key={area.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedFocusAreas.includes(area.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}
                `}
                onClick={() => toggleFocusArea(area.id)}
              >
                <div className="flex items-center gap-2">
                  {selectedFocusAreas.includes(area.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                  <span>{area.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Movements Sequence */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Workout Movements*</h3>
            <Button
              type="button"
              onClick={addMovement}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Movement
            </Button>
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Add and arrange movements for this workout. Drag to reorder.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="movements-list">
              {(provided: any) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {workoutMovementsList.map((movement, index) => (
                    <Draggable
                      key={movement.id}
                      draggableId={movement.id}
                      index={index}
                    >
                      {(provided: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-md p-3 bg-white dark:bg-neutral-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab p-1"
                              >
                                <GripVertical className="h-5 w-5 text-neutral-400" />
                              </div>
                              <span className="font-medium">#{movement.sequence_order}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMovement(index)}
                              className="h-8 w-8 p-0 text-neutral-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <Label htmlFor={`movement-${index}`}>Movement*</Label>
                              <Select 
                                value={movement.movement_id} 
                                onValueChange={(value) => updateMovement(index, 'movement_id', value)}
                              >
                                <SelectTrigger id={`movement-${index}`}>
                                  <SelectValue placeholder="Select Movement" />
                                </SelectTrigger>
                                <SelectContent>
                                  {movements.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name} {m.difficulty_level && `(${m.difficulty_level})`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`duration-${index}`}>Duration (seconds)</Label>
                              <Input
                                id={`duration-${index}`}
                                type="number"
                                min="0"
                                value={movement.duration_seconds}
                                onChange={(e) => updateMovement(index, 'duration_seconds', e.target.value)}
                                placeholder="Duration"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`reps-${index}`}>Repetitions</Label>
                              <Input
                                id={`reps-${index}`}
                                type="number"
                                min="0"
                                value={movement.repetitions}
                                onChange={(e) => updateMovement(index, 'repetitions', e.target.value)}
                                placeholder="Reps"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`sets-${index}`}>Sets</Label>
                              <Input
                                id={`sets-${index}`}
                                type="number"
                                min="0"
                                value={movement.sets}
                                onChange={(e) => updateMovement(index, 'sets', e.target.value)}
                                placeholder="Sets"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {workoutMovementsList.length === 0 && (
                    <div className="border border-dashed rounded-md p-6 text-center text-neutral-500">
                      <p>No movements added. Click "Add Movement" to start building your workout.</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <Button
            type="button"
            onClick={addMovement}
            variant="outline"
            className="mt-4 w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Movement
          </Button>
        </CardContent>
      </Card>
      
      {/* Error messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-md flex items-start gap-3">
          <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>Workout {isEditing ? 'updated' : 'created'} successfully! Redirecting...</p>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/workouts')}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Workout' : 'Create Workout'}
        </Button>
      </div>
    </form>
  );
} 