import { useState, useRef } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Input,
  HStack,
  IconButton,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Image,
  Progress,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'

const OCR_API = '/api/ocr'

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result || '')
      const base64 = s.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const pop = keyframes`
  0% { transform: scale(0.98); opacity: 0 }
  60% { transform: scale(1.02); opacity: 1 }
  100% { transform: scale(1); opacity: 1 }
`

export default function Ocr2Json() {
  const [fileName, setFileName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [jsonText, setJsonText] = useState<string>('')
  const [statusMsg, setStatusMsg] = useState('No JSON yet')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  const floatKey = keyframes`
    0% { transform: translateY(0) }
    50% { transform: translateY(-6px) }
    100% { transform: translateY(0) }
  `

  // Simple JSON syntax highlighter (returns HTML string). Escapes first then wraps tokens.
  function highlightJson(raw: string) {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const j = esc(raw)
    // keys
    const withKeys = j.replace(/&quot;(.*?)&quot;(?=\s*:)/g, '<span style="color:#9CDCFE">&quot;$1&quot;</span>')
    // strings
    const withStrings = withKeys.replace(/&quot;(.*?)&quot;/g, '<span style="color:#CE9178">&quot;$1&quot;</span>')
    // numbers
    const withNumbers = withStrings.replace(/\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span style="color:#B5CEA8">$1</span>')
    // booleans
    const withBooleans = withNumbers.replace(/\b(true|false)\b/g, '<span style="color:#569CD6">$1</span>')
    // null
    const withNull = withBooleans.replace(/\bnull\b/g, '<span style="color:#808080">null</span>')
    return withNull.replace(/\n/g, '<br/>').replace(/\s\s/g, '&nbsp;&nbsp;')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    // show preview for images
    try {
      if (/image\//.test(f.type)) setPreviewUrl(URL.createObjectURL(f))
      else setPreviewUrl(null)
    } catch { setPreviewUrl(null) }
    try {
      const b = await readFileAsBase64(f)
      await sendToWebhook(b, f.name, f.type)
    } catch (err: any) {
      console.error(err)
      setStatusMsg('Failed to read file')
      toast({ title: 'Read error', status: 'error', duration: 3000 })
    }
  }

  async function sendToWebhook(base64: string, name: string, mime: string) {
    setProcessing(true)
    setStatusMsg('Processing...')
    const payload = { fileData: base64, fileName: name, fileMimeType: mime }
    try {
      const resp = await fetch(OCR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '')
        setStatusMsg(`Error: ${resp.status} ${txt}`)
        toast({ title: 'Upload failed', description: txt || `Status ${resp.status}`, status: 'error', duration: 4000 })
        setProcessing(false)
        return
      }
      const data = await resp.json()
      const arr = Array.isArray(data) ? data : [data]
      setJsonText(JSON.stringify(arr, null, 2))
      setStatusMsg('JSON updated')
      toast({ title: 'OCR complete', status: 'success', duration: 2500 })
    } catch (err) {
      console.error('Fetch error', err)
      setStatusMsg('Network or CORS error')
      toast({ title: 'Network error', status: 'error', duration: 4000 })
    } finally { setProcessing(false) }
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(jsonText)
      setStatusMsg('Copied to clipboard')
      toast({ title: 'Copied', status: 'info', duration: 1500 })
    } catch (e) { setStatusMsg('Copy failed'); toast({ title: 'Copy failed', status: 'error', duration: 2000 }) }
  }

  function downloadJson() {
    const blob = new Blob([jsonText || '{}'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName ? `${fileName.replace(/\.[^/.]+$/, '')}_ocr.json` : 'ocr_result.json'
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    setStatusMsg('Downloaded')
    toast({ title: 'Downloaded', status: 'success', duration: 1500 })
  }

  // Drag & drop handlers
  function handleDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault(); setDragOver(false)
    const f = ev.dataTransfer.files?.[0]
    if (!f) return
    setFileName(f.name)
    try { if (/image\//.test(f.type)) setPreviewUrl(URL.createObjectURL(f)); else setPreviewUrl(null) } catch { setPreviewUrl(null) }
    readFileAsBase64(f).then(b => sendToWebhook(b, f.name, f.type)).catch(err => { console.error(err); toast({ title: 'File read error', status: 'error' }) })
  }

  function handleDragOver(ev: React.DragEvent) { ev.preventDefault(); setDragOver(true) }
  function handleDragLeave() { setDragOver(false) }

  return (
    <Box as="main">
      <Topbar />
      <Container maxW="6xl" py={10}>
        <Stack spacing={6} animation={`${pop} 420ms ease`}>
          <Box bgGradient={useColorModeValue('linear(to-br, pink.400, orange.300)', 'linear(to-br, purple.700, pink.600)')} color="white" p={6} borderRadius="xl" boxShadow="lg">
            <Heading size="lg">🧾 OCR → JSON</Heading>
            <Text mt={2}>Turn receipts into clean, validated JSON in one smooth step. Drag & drop files or use the picker.</Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box layerStyle="card" p={6} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} border={dragOver ? '2px dashed' : undefined} borderColor={dragOver ? 'purple.400' : undefined} transition="all 120ms">
              <Heading size="md" mb={4}>Upload your Receipt/Invoice</Heading>
              <Text mb={3} color={useColorModeValue('gray.600','gray.300')}>Supported: PDF, JPG, PNG, WEBP</Text>
              <Box display="flex" gap={4} alignItems="center">
                <Input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png,.webp" onChange={handleFile} hidden />
                <Button onClick={() => fileInputRef.current?.click()} colorScheme="purple" bgGradient={useColorModeValue('linear(to-r, purple.400, pink.300)','linear(to-r, purple.600, pink.500)')} _hover={{ transform: 'translateY(-2px)' }}>
                  📁 Choose file
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">Or browse</Button>
                <Text color={useColorModeValue('gray.500','gray.400')}>{fileName || 'No file selected'}</Text>
              </Box>

              {previewUrl ? (
                <Box mt={4} borderRadius="md" overflow="hidden" maxW="240px" _hover={{ transform: 'scale(1.02)', boxShadow: 'lg' }} transition="all 120ms">
                  <Image src={previewUrl} alt="preview" objectFit="cover" w="240px" h="160px" />
                </Box>
              ) : (
                <Box mt={4} p={4} borderRadius="md" bg={useColorModeValue('gray.50','gray.900')}>Drop files here to upload</Box>
              )}

              <HStack spacing={3} mt={6}>
                <Button colorScheme="green" isDisabled={processing || !fileName} onClick={() => toast({ title: 'Use file input to auto-send', status: 'info' })}>
                  🚀 Process Document
                </Button>
                <Button variant="ghost" onClick={copyJson} isDisabled={!jsonText}>Copy JSON</Button>
                <Button variant="outline" onClick={downloadJson} isDisabled={!jsonText}>Download JSON</Button>
              </HStack>
              <Text mt={3} color={useColorModeValue('gray.500','gray.400')}>{statusMsg}</Text>
              {processing && <Progress size="sm" isIndeterminate mt={3} />}
            </Box>

            <Box layerStyle="card" p={6} position="relative">
              {/* tilted corner accent */}
              <Box position="absolute" top={-6} right={-10} transform="rotate(18deg)" bgGradient={useColorModeValue('linear(to-r,#F6E05E,#F97316)','linear(to-r,#9F7AEA,#ED64A6)')} w="40%" h="32px" borderRadius="md" opacity={0.95} />
              <Heading size="md" mb={4}>JSON Output</Heading>
              <Box bg="black" color="white" p={4} borderRadius="md" minH="320px" overflow="auto" fontFamily="mono">
                {jsonText ? (
                  <Box
                    as="div"
                    dangerouslySetInnerHTML={{ __html: highlightJson(jsonText) }}
                    sx={{ '& span': { display: 'inline-block' }, whiteSpace: 'pre', fontSize: '0.95rem' }}
                  />
                ) : (
                  <Box color="gray.400">{
                    `{
  "message": "No JSON to display yet"
}`
                  }</Box>
                )}
              </Box>
            </Box>
          </SimpleGrid>
        </Stack>
      </Container>
      <Footer />
    </Box>
  )
}
