import { useState, useEffect } from 'react'
import './App.css'

import Editor from "react-simple-code-editor"
import Prism from "prismjs"

import "prismjs/components/prism-javascript"
import "prismjs/themes/prism-tomorrow.css"

import axios from 'axios'
import Markdown from "react-markdown"

import remarkGfm from "remark-gfm"
import remarkEmoji from "remark-emoji"

import { Bot, Code } from "lucide-react"

function App() {

  const [code, setCode] = useState(`function sum(a,b){
  return a+b;
}`)

  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Prism.highlightAll()
  }, [])

  async function reviewCode() {

    if (loading) return

    try {

      setLoading(true)

      const response = await axios.post(
        "https://aicodereviewbackend.onrender.com",
        { code }
      )

      console.log(response.data)
      setReview(response.data)

    } catch (error) {

      if (error.response?.status === 429) {
        setReview("⚠️ Too many requests. Please wait a few seconds and try again.")
      } else {
        setReview("❌ Something went wrong while reviewing the code.")
      }

      console.error(error)

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen bg-[#0d1117] text-white flex gap-4 p-4">

      {/* LEFT SIDE */}
      <div className="w-1/2 bg-[#161b22] rounded-xl border border-gray-700 flex flex-col shadow-xl">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 text-gray-300 font-semibold flex items-center gap-2">
          <Code size={18} className="text-blue-400" />
          Code Editor
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-4">

          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code =>
              Prism.highlight(code, Prism.languages.javascript, "javascript")
            }
            padding={12}
            style={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 14,
              background: "#0d1117",
              minHeight: "100%",
              borderRadius: "6px",
              outline: "none"
            }}
          />

        </div>

        {/* Button */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={reviewCode}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 transition
              ${loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 cursor-pointer"
              }`}
          >
            <Bot size={16} />
            {loading ? "Reviewing..." : "Review Code"}
          </button>
        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="w-1/2 bg-[#161b22] rounded-xl border border-gray-700 flex flex-col shadow-xl">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 text-gray-300 font-semibold flex items-center gap-2">
          <Bot size={18} className="text-purple-400" />
          AI Code Review
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-6 text-gray-300 leading-relaxed
        prose prose-invert max-w-none
        scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
        hover:scrollbar-thumb-gray-500">

          <Markdown
            remarkPlugins={[remarkGfm, remarkEmoji]}
            components={{
              code({ inline, className, children }) {

                return !inline ? (
                  <pre className="bg-[#0d1117] p-4 rounded-lg overflow-auto border border-gray-700">
                    <code className={className}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-800 px-1 py-0.5 rounded">
                    {children}
                  </code>
                )

              }
            }}
          >
            {review}
          </Markdown>

        </div>

      </div>

    </main>
  )
}

export default App
