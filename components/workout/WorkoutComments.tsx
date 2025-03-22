'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { addWorkoutComment, getWorkoutComments, toggleCommentLike, deleteWorkoutComment } from "@/utils/supabase/community"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Heart, MoreHorizontal, Flag, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkoutCommentsProps {
  workoutId: string
  userId: string
}

export default function WorkoutComments({ workoutId, userId }: WorkoutCommentsProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState<{[key: string]: boolean}>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      content: ""
    }
  })

  // Load comments
  useEffect(() => {
    async function loadComments() {
      setLoading(true)
      try {
        const commentsData = await getWorkoutComments(workoutId, 1)
        if (commentsData && commentsData.data) {
          setComments(commentsData.data)
          setHasMore(commentsData.data.length === 10) // Assuming 10 is the limit per page
        }
      } catch (error) {
        console.error("Error loading comments:", error)
        toast.error("Failed to load comments")
      } finally {
        setLoading(false)
      }
    }
    
    loadComments()
  }, [workoutId])

  // Load more comments
  const loadMoreComments = async () => {
    try {
      const nextPage = page + 1
      const moreComments = await getWorkoutComments(workoutId, nextPage)
      
      if (moreComments && moreComments.data && moreComments.data.length > 0) {
        setComments(prev => [...prev, ...moreComments.data])
        setPage(nextPage)
        setHasMore(moreComments.data.length === 10) // Assuming 10 is the limit per page
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more comments:", error)
      toast.error("Failed to load more comments")
    }
  }

  // Submit a new comment
  const onSubmit = async (data: { content: string }) => {
    try {
      const newComment = await addWorkoutComment(workoutId, userId, data.content)
      
      if (newComment) {
        // Add the comment to the top of the list
        setComments(prev => [newComment, ...prev])
        // Clear the form
        reset()
        toast.success("Comment added")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    }
  }

  // Toggle like on a comment
  const handleLike = async (commentId: string) => {
    setLoadingAction(prev => ({ ...prev, [`like-${commentId}`]: true }))
    
    try {
      const result = await toggleCommentLike(commentId, userId)
      
      if (result) {
        // Update the comment in the list
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  likes_count: result.likesCount,
                  user_has_liked: result.liked
                } 
              : comment
          )
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to like comment")
    } finally {
      setLoadingAction(prev => ({ ...prev, [`like-${commentId}`]: false }))
    }
  }

  // Delete a comment
  const handleDelete = async (commentId: string) => {
    setLoadingAction(prev => ({ ...prev, [`delete-${commentId}`]: true }))
    
    try {
      const success = await deleteWorkoutComment(commentId, userId)
      
      if (success) {
        // Remove the comment from the list
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast.success("Comment deleted")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    } finally {
      setLoadingAction(prev => ({ ...prev, [`delete-${commentId}`]: false }))
    }
  }

  // Helper function to get initials from name or email
  const getInitials = (user?: any) => {
    if (!user) return '';
    
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }

    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }

    return '#'
  }

  // Helper to get display name
  const getDisplayName = (user?: any) => {
    if (!user) return 'Unknown User';
    
    if (user?.name) {
      return user.name;
    }

    if (user?.email) {
      // Only show first part of email before @
      return user.email.split('@')[0]
    }

    return 'Anonymous User'
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Community Comments</h2>
      
      {/* Add comment form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          {...register("content", { required: true })}
          placeholder="Share your thoughts, tips, or encouragement..."
          className="min-h-24"
        />
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            variant="secondary" 
            className="w-full sm:w-auto bg-neutral-600 hover:bg-neutral-700 text-white dark:bg-neutral-500 dark:hover:bg-neutral-400"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeletons
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : comments.length > 0 ? (
          <>
            {comments.map(comment => (
              <div key={comment.id} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border shadow-sm">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      {comment.user?.avatar_url ? (
                        <AvatarImage src={comment.user.avatar_url} alt={getDisplayName(comment.user)} />
                      ) : null}
                      <AvatarFallback>{getInitials(comment.user)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getDisplayName(comment.user)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        {comment.is_edited && " (edited)"}
                      </p>
                    </div>
                  </div>
                  
                  {comment.user?.id === userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                          <MoreHorizontal size={16} />
                          <span className="sr-only">Comment actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDelete(comment.id)}
                          disabled={loadingAction[`delete-${comment.id}`]}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <p className="mb-4 whitespace-pre-wrap">{comment.content}</p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant={comment.user_has_liked ? "secondary" : "outline"}
                    size="sm"
                    className={`gap-1 ${comment.user_has_liked ? "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600" : ""}`}
                    onClick={() => handleLike(comment.id)}
                    disabled={loadingAction[`like-${comment.id}`]}
                  >
                    <Heart className={`h-4 w-4 ${comment.user_has_liked ? "fill-neutral-700 dark:fill-neutral-300" : ""}`} />
                    {comment.likes_count}
                  </Button>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMoreComments} className="border-neutral-400 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800">
                  Load More Comments
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 