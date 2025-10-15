"use client"

import { useState } from "react"
import { NoteSidebar } from "@/components/note-sidebar"
import { NoteEditor } from "@/components/note-editor"

export interface Note {
  id: string
  title: string
  body: string
  createdAt: Date
  updatedAt: Date
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSaveNote = (title: string, body: string) => {
    if (selectedNoteId) {
      // Update existing note
      setNotes((prev) =>
        prev.map((note) => (note.id === selectedNoteId ? { ...note, title, body, updatedAt: new Date() } : note)),
      )
    } else {
      // Create new note
      const newNote: Note = {
        id: crypto.randomUUID(),
        title,
        body,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setNotes((prev) => [newNote, ...prev])
      setSelectedNoteId(newNote.id)
      setIsCreatingNew(false)
    }
  }

  const handleNewNote = () => {
    setSelectedNoteId(null)
    setIsCreatingNew(true)
  }

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
    setIsCreatingNew(false)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <NoteSidebar
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
      />
      <NoteEditor note={selectedNote} onSave={handleSaveNote} isNewNote={isCreatingNew} />
    </div>
  )
}
