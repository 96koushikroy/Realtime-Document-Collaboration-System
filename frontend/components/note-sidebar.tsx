"use client"

import { Search, Plus, FileText, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Note } from "@/app/page"

interface NoteSidebarProps {
  notes: Note[]
  selectedNoteId: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectNote: (noteId: string) => void
  onNewNote: () => void
  onDeleteNote: (noteId: string) => void
  sessionId: string
}

export function NoteSidebar({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  sessionId,
}: NoteSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return "Today"
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <aside className="w-80 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="sticky top-0 z-10 p-4 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Notes</h1>
          <Button
            onClick={onNewNote}
            size="sm"
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2 bg-sidebar">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-colors",
                    "hover:bg-sidebar-accent",
                    selectedNoteId === note.id && "bg-sidebar-accent",
                  )}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-sidebar-foreground truncate mb-1">
                        {note.title || "Untitled Note"}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{note.body || "No content"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteNote(note.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="sticky bottom-0 z-10 p-3 border-t border-sidebar-border bg-sidebar">
        <button
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground font-medium">Session</span>
            <code className="text-xs font-mono text-sidebar-foreground truncate">{sessionId}</code>
          </div>
        </button>
      </div>
    </aside>
  )
}
