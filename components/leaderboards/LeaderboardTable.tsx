import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

interface LeaderboardTableProps {
  entries: Array<{
    rank: number
    score: number
    user: {
      id: string
      full_name?: string
      email?: string
      avatar_url?: string
    }
    last_updated: string
  }>
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  // Helper function to get initials from name or email
  const getInitials = (entry: LeaderboardTableProps['entries'][0]) => {
    if (entry.user?.full_name) {
      return entry.user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }

    if (entry.user?.email) {
      return entry.user.email.substring(0, 2).toUpperCase()
    }

    return '#'
  }

  // Helper to get display name
  const getDisplayName = (entry: LeaderboardTableProps['entries'][0]) => {
    if (entry.user?.full_name) {
      return entry.user.full_name
    }

    if (entry.user?.email) {
      // Only show first part of email before @
      return entry.user.email.split('@')[0]
    }

    return 'Anonymous User'
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Athlete</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right hidden md:table-cell">Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={`${entry.user?.id}-${entry.rank}`}>
            <TableCell className="font-medium">
              {entry.rank <= 3 ? (
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-bold
                  ${entry.rank === 1 ? 'bg-yellow-500' : 
                    entry.rank === 2 ? 'bg-slate-400' : 
                    'bg-amber-800'}
                `}>
                  {entry.rank}
                </div>
              ) : entry.rank}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {entry.user?.avatar_url ? (
                    <AvatarImage src={entry.user.avatar_url} alt={getDisplayName(entry)} />
                  ) : null}
                  <AvatarFallback>{getInitials(entry)}</AvatarFallback>
                </Avatar>
                <span>{getDisplayName(entry)}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-semibold">{entry.score}</TableCell>
            <TableCell className="text-right text-muted-foreground hidden md:table-cell">
              {entry.last_updated
                ? formatDistanceToNow(new Date(entry.last_updated), { addSuffix: true })
                : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 