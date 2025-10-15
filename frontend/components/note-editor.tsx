"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Save, FileText } from "lucide-react"
import type { Note } from "@/app/page"

interface NoteEditorProps {
  note?: Note
  onSave: (title: string, body: string) => void
  isNewNote?: boolean
}

export function NoteEditor({ note, onSave, isNewNote }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body)
    } else {
      setTitle("")
      setBody("")
    }
  }, [note])

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
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-bold bg-transparent border-none outline-none mb-8 placeholder:text-muted-foreground/40 text-foreground"
            />
            <textarea
              placeholder="Start writing..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1 resize-none bg-transparent border-none outline-none text-lg leading-relaxed placeholder:text-muted-foreground/40 text-foreground/90 font-normal"
            />
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
