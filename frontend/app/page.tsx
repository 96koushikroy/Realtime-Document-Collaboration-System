"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { NoteSidebar } from "@/components/note-sidebar"
import { NoteEditor } from "@/components/note-editor"

export interface Note {
  id: string
  title: string
  body: string
  createdAt: Date
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const sId = localStorage.getItem("session_id")
      return sId ?? ""
    } catch {
      return ""
    }
  })
  const [mounted, setMounted] = useState(false)

  const searchNotes = async (query: string) => {
    if (!query.trim()) {
      try {
        const res = await axios.get("http://localhost:3000/notes")
        const serverNotes: Note[] = (res.data || []).map((n: any) => ({
          id: String(n.id),
          title: String(n.note_title || ""),
          body: String(n.note || ""),
          createdAt: new Date(n.created_at),
        }))

        console.log(serverNotes)
        setNotes(serverNotes)
      } catch (err) {
        console.error("Failed to fetch notes:", err)
      }
      return
    }

    try {
      setIsSearching(true)
      const res = await axios.post("http://localhost:3000/search", {
        query: query.trim(),
        limit: 10
      })

      const searchResults = res.data.map((n: any) => ({
        id: String(n.id),
        title: String(n.note_title || ""),
        body: String(n.note || ""),
        createdAt: new Date(n.created_at),
      }))

      setNotes(searchResults)
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    let mounted = true
    setMounted(true)
    if (!sessionId) {
      try {
        const newId = crypto.randomUUID()
        localStorage.setItem("session_id", newId)
        if (mounted) setSessionId(newId)
      } catch (err) {
        console.error("Failed to create session id:", err)
      }
    }

    const fetchNotes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/notes")
        if (!mounted) return
        const serverNotes: Note[] = (res.data || []).map((n: any) => ({
          id: String(n.id),
          title: String(n.note_title || ""),
          body: String(n.note || ""),
          createdAt: new Date(n.created_at),
        }))
        setNotes(serverNotes)
      } catch (err) {
        console.error("Failed to fetch notes:", err)
      }
    }

    fetchNotes()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchNotes(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])


  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  const filteredNotes = notes

  const postNote = async (sessionId: string | null, note_title: string, noteBody: string) => {
    try {
      const payload = {
        session_id: sessionId,
        note_title,
        note: noteBody,
      }
      const response = await axios.post("http://localhost:3000/notes", payload)
      return response.data
    } catch (error) {
      console.error("Failed to post note:", error)
      throw error
    }
  }

  const handleSaveNote = async (title: string, body: string) => {
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
      }
      await postNote("some-random-id", title, body)
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
        sessionId={mounted ? sessionId : ""}
      />
      <NoteEditor note={selectedNote} onSave={handleSaveNote} isNewNote={isCreatingNew} />
    </div>
  )
}
