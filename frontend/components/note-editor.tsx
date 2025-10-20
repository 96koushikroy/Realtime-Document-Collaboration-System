"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Save, FileText } from "lucide-react"
import type { Note } from "@/app/page"
import io, { Socket } from "socket.io-client"
import { UserCaret } from "./user-caret"

// Define socket outside the component to prevent re-instantiation on re-renders
let socket: Socket

interface NoteEditorProps {
  note?: Note
  onSave: (title: string, body: string) => void
  isNewNote?: boolean
  sessionId: string
}

export function NoteEditor({ note, onSave, isNewNote, sessionId }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [remoteCarets, setRemoteCarets] = useState<Record<string, number>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body)
    } else {
      setTitle("")
      setBody("")
    }
    setRemoteCarets({});
  }, [note])

  useEffect(() => {
    socket = io("http://localhost:3000")

    socket.on('connect', () => {
      console.log('Connected to WebSocket server!')
      if (note?.id) {
        socket.emit('join_note_room', { noteId: note.id, sessionId })
      }
    })

    socket.on('receive_changes', (data: { title: string; body: string }) => {
      setTitle(data.title)
      setBody(data.body)
    })

    socket.on('receive_cursor_change', (data: { sessionId: string; position: number }) => {
      if (data.sessionId !== sessionId) {
        setRemoteCarets(prev => ({ ...prev, [data.sessionId]: data.position }));
      }
    });

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [note?.id, sessionId])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (socket && note?.id) {
      socket.emit('send_changes', { noteId: note.id, title: newTitle, body })
    }
  }

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBody = e.target.value
    setBody(newBody)
    if (socket && note?.id) {
      socket.emit('send_changes', { noteId: note.id, title, body: newBody })
    }
  }

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (socket && note?.id && target.selectionStart !== null) {
      socket.emit('cursor_change', {
        noteId: note.id,
        sessionId: sessionId,
        position: target.selectionStart,
      });
    }
  };

  const handleSave = () => {
    if (title.trim() || body.trim()) {
      onSave(title.trim(), body.trim())
    }
  }

  const showEditor = note || isNewNote || title || body

  return (
    <main className="flex-1 flex flex-col">
      {showEditor ? (
        <>
          <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full">
            <input
              type="text"
              placeholder="Untitled"
              value={title}
              onChange={handleTitleChange}
              className="text-4xl font-bold bg-transparent border-none outline-none mb-8 placeholder:text-muted-foreground/40 text-foreground"
            />
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                placeholder="Start writing..."
                value={body}
                onChange={handleBodyChange}
                onSelect={handleSelectionChange}
                className="absolute inset-0 w-full h-full resize-none bg-transparent border-none outline-none text-lg leading-relaxed placeholder:text-muted-foreground/40 text-foreground/90 font-normal"
              />
              
              {Object.entries(remoteCarets).map(([id, position]) => (
                <UserCaret
                  key={id}
                  textareaRef={textareaRef}
                  position={position}
                  sessionId={id}
                />
              ))}
            </div>
          </div>
          <div className="border-t border-border/50 p-4 flex justify-end bg-background/50 backdrop-blur-sm">
            <Button
              onClick={handleSave}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Select a note or create a new one</h2>
            <p className="text-muted-foreground/60">Your notes will appear here</p>
          </div>
        </div>
      )}
    </main>
  )
}