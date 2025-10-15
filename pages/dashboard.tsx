import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Button,
  SimpleGrid,
  Text,
  FormLabel,
  Link as ChakraLink,
  Heading,
  Badge,
  Container,
  Flex,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Select,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Collapse,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import Topbar from '../components/Topbar'
import Footer from '../components/Footer'

const WEBHOOK_API = '/api/listings'
const TEST_API = '/api/test'

function formatCurrency(number: number | undefined) {
  if (typeof number !== 'number') return 'N/A'
  return '฿' + number.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const rise = keyframes`
  from { transform: translateY(12px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
`

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246, 0.7); }
  70% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(139,92,246, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,92,246, 0); }
`

// Animated number component (hoisted)
function AnimatedNumber({ value, suffix = '', duration = 600, easing = 'easeOutCubic' }: { value: number; suffix?: string; duration?: number; easing?: string }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef<number>(0)

  const ease = (t: number) => {
    switch (easing) {
      case 'linear': return t
      case 'easeIn': return t * t
      case 'easeOut': return t * (2 - t)
      // easeOutCubic
      default: return 1 - Math.pow(1 - t, 3)
    }
  }

  useEffect(() => {
    const start = performance.now()
    startRef.current = start
    fromRef.current = display
    const target = Math.max(0, Math.floor(value))

    const step = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const t = Math.min(1, Math.max(0, elapsed / duration))
      const eased = ease(t)
      const current = Math.round(fromRef.current + (target - fromRef.current) * eased)
      setDisplay(current)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else { setDisplay(target); if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null } }
    }

    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, easing])

  return <>{display.toLocaleString()}{suffix}</>
}

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(6)
  const [loading, setLoading] = useState(false)
  const [alertLog, setAlertLog] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'row-desc' | 'row-asc'>('newest')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMsg, setModalMsg] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => { fetchListings() }, [])

  async function fetchListings() {
    setLoading(true)
    try {
      const resp = await fetch(`${WEBHOOK_API}?_=${Date.now()}`, { cache: 'no-store' })
      if (!resp.ok) {
        let details = ''
        try { const j = await resp.json(); details = j && (j.error || j.message || JSON.stringify(j)) } catch (e) { try { details = await resp.text() } catch { details = '' } }
        const msg = `HTTP ${resp.status}` + (details ? `: ${details}` : '')
        throw new Error(msg)
      }
      const raw = await resp.json()
      const items = (Array.isArray(raw) ? raw : [raw]).map((item: any) => {
        const norm: any = {}
        for (const k in item) if (Object.prototype.hasOwnProperty.call(item, k)) norm[k.trim()] = item[k]
        norm.CleanPrice = Number(norm.CleanPrice || norm.Price || 0) || 0
        norm.IsOwner = typeof norm.IsOwner === 'string' ? /true|1|yes/i.test(norm.IsOwner) : Boolean(norm.IsOwner)
        return norm
      })
      setListings(items)
      // Apply current sort after fetching
      if (sortOption) {
        setListings(prev => applySort(prev, sortOption))
      }
      setAlertLog(items.slice(0, 3).map((it: any) => `New ${it.ListingType || ''} ${it.PropertyType || ''} - ${formatCurrency(it.CleanPrice)}`))
    } catch (err) {
      console.error('Failed to load listings', err)
      setAlertLog(prev => ['CONNECTION ERROR: Could not fetch listing data.', ...prev].slice(0, 5))
    } finally { setLoading(false) }
  }

  function applySort(items: any[], option: typeof sortOption) {
    const copy = [...items]
    switch (option) {
      case 'newest':
        // assume PostDate or PostID roughly indicates recency
        return copy.sort((a, b) => (b.PostDate || b.PostID || 0) > (a.PostDate || a.PostID || 0) ? 1 : -1)
      case 'oldest':
        return copy.sort((a, b) => (a.PostDate || a.PostID || 0) > (b.PostDate || b.PostID || 0) ? 1 : -1)
      case 'row-desc':
        return copy.sort((a, b) => (Number(b.CleanPrice || 0) - Number(a.CleanPrice || 0)))
      case 'row-asc':
        return copy.sort((a, b) => (Number(a.CleanPrice || 0) - Number(b.CleanPrice || 0)))
      default:
        return copy
    }
  }

  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize))
  const pageItems = listings.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

  // derived metrics for Overview
  const ownersCount = listings.filter(l => l.IsOwner).length
  const agentsCount = Math.max(0, listings.length - ownersCount)
  const typeCounts: Record<string, number> = listings.reduce((acc: Record<string, number>, l) => {
    const t = (l.PropertyType || 'Unknown') as string
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const topType = Object.keys(typeCounts).sort((a, b) => (typeCounts[b] || 0) - (typeCounts[a] || 0))[0] || '—'
  const topTypeCount = typeCounts[topType] || 0

  // compute IDs/row_numbers considered "new"
  // determine highest row_number (if present) and the 3 most recent by that key (fallback to PostID)
  const rowNumbers = listings.map(l => Number(l.row_number || l.PostID || 0)).filter(n => !Number.isNaN(n) && n > 0)
  const highestRowNumber = rowNumbers.length ? Math.max(...rowNumbers) : 0
  const sortedByRowDesc = [...listings].sort((a, b) => (Number(b.row_number || b.PostID || 0) - Number(a.row_number || a.PostID || 0)))
  const latestThreeIds = sortedByRowDesc.slice(0, 3).map(l => Number(l.row_number || l.PostID || 0)).filter(n => !Number.isNaN(n) && n > 0)

  // activity candidates and filtered "new" items (reused by Activity panel and bubble)
  const activityCandidates: any[] = listings.length > 0 ? listings : alertLog.slice(0, 3)
  const [seenIds, setSeenIds] = useState<number[]>([])

  // Persist seen IDs to localStorage so the user doesn't get repeated "new" badges
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dashboard.seenIds')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const nums = parsed.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
          setSeenIds(nums)
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('dashboard.seenIds', JSON.stringify(seenIds))
    } catch (e) {
      // ignore quota / access errors
    }
  }, [seenIds])

  const filteredNewItems: any[] = (Array.isArray(listings) && listings.length > 0)
    ? (activityCandidates as any[]).filter((it: any) => {
      const rn = Number(it.row_number || it.PostID || 0)
      if (!rn || Number.isNaN(rn)) return false
      // exclude items already seen/read
      if (seenIds.includes(rn)) return false
      return latestThreeIds.includes(rn) || rn >= highestRowNumber
    }).slice(0, 3)
    : (activityCandidates as any[]).slice(0, 3).map(i => (typeof i === 'string' ? { message: i } : i)).filter((it: any, idx: number) => {
      // strings fallback don't have numeric ids; include them unless already seen via a string marker
      return true
    })

  // bubble/chat UI state
  const [chatOpen, setChatOpen] = useState(false)
  const newCount = filteredNewItems.length
  const prevNewCount = useRef<number>(0)

  // Auto-open chat when newCount increases (new items arrived)
  useEffect(() => {
    if (newCount > 0 && prevNewCount.current < newCount) {
      // play a short beep and open chat
      try { playBeep() } catch (e) { /* ignore */ }
      setChatOpen(true)
    }
    prevNewCount.current = newCount
  }, [newCount])

  // polling to refresh listings periodically so we pick up backend/webhook pushes
  useEffect(() => {
    const id = setInterval(() => { fetchListings() }, 8000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // helper to mark items as read
  function markAsRead(items: any[]) {
    const ids = items.map((it: any) => Number(it.row_number || it.PostID || 0)).filter(n => !Number.isNaN(n) && n > 0)
    if (ids.length === 0) return
    setSeenIds(prev => Array.from(new Set([...prev, ...ids])))
    // reset previous counter so an immediate auto-open doesn't re-trigger
    prevNewCount.current = 0
  }

  // WebAudio beep
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
      o.start()
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02)
        try { o.stop() } catch (e) { }
        try { ctx.close() } catch (e) { }
      }, 260)
    } catch (e) {
      // fallback: try HTML Audio (may be blocked until user interacts)
      try { const a = new Audio(); a.play().catch(() => { }) } catch (e) { }
    }
  }

  function toggleExpand(id: number) {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function openModal() { setModalOpen(true); setModalMsg('Preparing test...'); setCountdown(180) }
  function closeModal() { setModalOpen(false); setCountdown(0); setModalMsg('') }

  useEffect(() => {
    if (!modalOpen) return
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(id)
  }, [modalOpen, countdown])

  async function doTest() {
    openModal()
    try {
      setModalMsg('Sending test request...')
      const resp = await fetch(`${TEST_API}?_=${Date.now()}`, { method: 'GET', cache: 'no-store' })
      if (!resp.ok) setModalMsg('Request failed: ' + resp.status)
      else setModalMsg('Request sent. Waiting for results...')
    } catch (err: any) {
      setModalMsg('Test failed: ' + (err?.message || String(err)))
    }
  }

  const accent = useColorModeValue('linear(to-r, teal.50, white)', 'linear(to-r, teal.700, purple.700)')
  const cardBg = useColorModeValue('bg-surface', 'bg-surface')

  return (
    <Box as="main">
      <Topbar onTestClick={doTest} />
      <Container maxW="6xl" py={{ base: 8, md: 12 }}>
        <Heading mb={2} bgGradient="linear(to-r, teal.300, blue.400, purple.400)" bgClip="text">Dashboard</Heading>
        <Text fontSize="sm" mb={2} color="gray.500" >แสดงผลลัพธ์การ Scrape, Cleansing, และ Alert จาก DDproperty, LivingInsider, Kaidee</Text>
        {/* Control row: sort + test button */}
        <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }} alignItems="center" justifyContent="space-between">
          <Flex gap={3} alignItems="center">
            <FormLabel htmlFor="sort-select" fontWeight="semibold" mb={0}>Sort:</FormLabel>
            <Select id="sort-select" title="Sort listings" aria-label="Sort listings" aria-labelledby="sort-select" value={sortOption} onChange={(e) => { const v = e.target.value as any; setSortOption(v); setListings(prev => applySort(prev, v)); }} width="220px">
              <option value="newest">ใหม่สุด (Newest)</option>
              <option value="oldest">เก่าสุด (Oldest)</option>
              <option value="row-desc">ราคา: มาก → น้อย</option>
              <option value="row-asc">ราคา: น้อย → มาก</option>
            </Select>
          </Flex>
          <Flex gap={3} alignItems="center">
            <Button onClick={doTest} colorScheme="purple" leftIcon={<Icon viewBox="0 0 24 24" boxSize={4}><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2" /></Icon>}>
              Test Now
            </Button>
            <Button onClick={fetchListings} variant="outline">Refresh</Button>
          </Flex>
        </Flex>

        <Box mb={6} p={{ base: 4, md: 6 }} borderRadius="xl" bgGradient={useColorModeValue('linear(to-r, teal.50, white)', 'linear(to-r, teal.800, purple.800)')}>
          <Text fontSize="lg" fontWeight="bold" mb={3} color={useColorModeValue('gray.700','gray.100')}>📈 AI Cleansing Metrics</Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box p={6} borderRadius="xl" layerStyle="elevated" boxShadow="lg" display="flex" alignItems="center" gap={6} animation={`${rise} 420ms both`} bg={useColorModeValue('linear(to-r, teal.100, teal.50)','linear(to-r, teal.700, teal.800)')} color={useColorModeValue('gray.800','gray.50')} sx={{ backdropFilter: useColorModeValue('blur(6px)','blur(8px)'), WebkitBackdropFilter: useColorModeValue('blur(6px)','blur(8px)'), border: useColorModeValue('1px solid rgba(255,255,255,0.6)','1px solid rgba(255,255,255,0.06)') }}>
              <Box bg={useColorModeValue('teal.600','teal.400')} color="white" p={4} borderRadius="lg">
                <Icon viewBox="0 0 24 24" boxSize={8}><path fill="currentColor" d="M3 6h18v2H3V6zm3 4h12v10H6V10zm6-9a2 2 0 100 4 2 2 0 000-4z" /></Icon>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Total Listings</Text>
                <Heading size="lg"><AnimatedNumber value={listings.length} duration={700} easing="easeOutCubic" /></Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>{ownersCount} owners • {agentsCount} agents</Text>
              </Box>
            </Box>

            <Box p={6} borderRadius="xl" layerStyle="elevated" boxShadow="lg" display="flex" alignItems="center" gap={6} animation={`${rise} 480ms both`} bg={useColorModeValue('linear(to-r, purple.200, pink.50)','linear(to-r, purple.700, purple.800)')} color={useColorModeValue('gray.800','gray.50')} sx={{ backdropFilter: useColorModeValue('blur(6px)','blur(8px)'), WebkitBackdropFilter: useColorModeValue('blur(6px)','blur(8px)'), border: useColorModeValue('1px solid rgba(255,255,255,0.6)','1px solid rgba(255,255,255,0.06)') }}>
              <Box bg={useColorModeValue('purple.600','purple.400')} color="white" p={4} borderRadius="lg">
                <Icon viewBox="0 0 24 24" boxSize={8}><path fill="currentColor" d="M12 2a3 3 0 100 6 3 3 0 000-6zm0 8c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" /></Icon>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Owner Ratio</Text>
                <Heading size="lg">
                  <AnimatedNumber value={Math.round((ownersCount / Math.max(1, listings.length)) * 100)} suffix="%" duration={900} easing="easeOutCubic" />
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>{ownersCount} owners</Text>
              </Box>
            </Box>

            <Box p={6} borderRadius="xl" layerStyle="elevated" boxShadow="lg" display="flex" alignItems="center" gap={6} animation={`${rise} 520ms both`} bg={useColorModeValue('linear(to-r, orange.100, yellow.50)','linear(to-r, orange.700, orange.800)')} color={useColorModeValue('gray.800','gray.50')} sx={{ backdropFilter: useColorModeValue('blur(6px)','blur(8px)'), WebkitBackdropFilter: useColorModeValue('blur(6px)','blur(8px)'), border: useColorModeValue('1px solid rgba(255,255,255,0.6)','1px solid rgba(255,255,255,0.06)') }}>
              <Box bg={useColorModeValue('orange.500','orange.300')} color="white" p={4} borderRadius="lg">
                <Icon viewBox="0 0 24 24" boxSize={8}><path fill="currentColor" d="M12 2l3 6h6l-4.5 3.5L19 20l-7-4-7 4 1.5-8.5L3 8h6z" /></Icon>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Top Type</Text>
                <Heading size="lg">{topType}</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>{topTypeCount} listings</Text>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>

        <Box mb={6}>
          <Flex align="center" justify="space-between" mb={3}>
            <Text fontSize="lg" fontWeight="bold">🚨 New Listing Alert | Activity |
              <IconButton
                aria-label="Open Telegram channel"
                as="a"
                href="https://t.me/+Rxk7yHq_8ogwYzFl"
                target="_blank"
                rel="noopener noreferrer"
                icon={<Icon viewBox="0 0 24 24" boxSize={4}><path fill="currentColor" d="M21.9 3.6c-.1-.4-.4-.6-.8-.6-.3 0-.6.1-.9.2L2.8 9.1c-.5.2-.8.7-.7 1.2.1.5.5.9 1 1l4.2 1.3 1.6 5.2c.2.7.9 1 1.5.9.3 0 .6-.1.8-.3l2.9-2.1 4.6 3.3c.4.2.8.2 1.1 0 .4-.2.6-.7.5-1.1L23 4.2c0-.4-.1-.7-.3-.9z"/></Icon>}
                color={useColorModeValue('gray.800', 'gray.100')}
                variant="ghost"
              /></Text>
            <Badge colorScheme={alertLog.length ? 'purple' : 'gray'}>{alertLog.length} recent</Badge>
          </Flex>

          <Stack spacing={3} aria-live="polite" role="status">
            {filteredNewItems.length === 0 ? (
              <Box p={3} layerStyle="card">
                <Text color="muted">No recent activity</Text>
              </Box>
            ) : (
              filteredNewItems.map((item: any, i: number) => {
                if (typeof item === 'string' || typeof item?.message === 'string') {
                  const text = typeof item === 'string' ? item : item.message
                  return (
                    <Box
                      key={i}
                      p={3}
                      bg={useColorModeValue('white','gray.800')}
                      borderRadius="md"
                      boxShadow="sm"
                      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                      transition="all 150ms"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      borderLeftWidth={4}
                      borderLeftColor={i === 0 ? 'green.400' : 'transparent'}
                    >
                      <Box bg={i === 0 ? 'green.400' : 'gray.300'} color={i === 0 ? 'white' : 'gray.700'} p={2} borderRadius="sm">
                        <Icon viewBox="0 0 24 24" boxSize={4}><path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></Icon>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" color="text-primary">{text}</Text>
                      </Box>
                      <Text fontSize="xs" color="muted">{new Date().toLocaleTimeString()}</Text>
                    </Box>
                  )
                }

                const listing = item
                const id = listing.PostID ?? listing.row_number ?? i
                const project = listing.ProjectName || listing['ProjectName'] || listing['ProjectName\t'] || 'ไม่ระบุ'
                const title = project !== 'ไม่ระบุ' ? project : ((listing.ListingType || '') + ' ' + (listing.PropertyType || '')).trim()
                const price = formatCurrency(listing.CleanPrice)
                const excerptRaw = String(listing.RawText || listing.Rawtext || listing['RawText'] || '')
                const excerpt = excerptRaw.length > 140 ? excerptRaw.slice(0, 140) + '…' : (excerptRaw || '—')
                const when = listing.PostDate ? new Date(listing.PostDate).toLocaleString() : new Date().toLocaleTimeString()
                const rn = Number(listing.row_number || listing.PostID || 0)
                const showNew = latestThreeIds.includes(rn) || rn >= highestRowNumber

                return (
                  <Box
                    key={id || i}
                    p={4}
                    bg={useColorModeValue('white','gray.800')}
                    borderRadius="md"
                    boxShadow="sm"
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                    transition="all 150ms"
                    borderLeftWidth={4}
                    borderLeftColor={i === 0 ? 'green.400' : 'transparent'}
                  >
                    <Flex align="start" gap={3}>
                      <Box bg={i === 0 ? 'green.400' : 'gray.300'} color={i === 0 ? 'white' : 'gray.700'} p={3} borderRadius="lg">
                        <Icon viewBox="0 0 24 24" boxSize={5}><path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></Icon>
                      </Box>
                      <Box flex="1">
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Text fontWeight="semibold">{title || 'Untitled'} {showNew ? <Badge ml={2} colorScheme="green" fontSize="0.6em">New</Badge> : null}</Text>
                            <Text fontSize="sm" color="muted">ID: {id} • {listing.ListingType || 'N/A'} {listing.PropertyType ? `• ${listing.PropertyType}` : ''}</Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontSize="sm" color="accent.default">{price}</Text>
                            <Text fontSize="xs" color="muted">{when}</Text>
                          </Box>
                        </Flex>
                        <Text mt={2} fontSize="sm" color="text-primary">{excerpt}</Text>
                      </Box>
                    </Flex>
                  </Box>
                )
              })
            )}
          </Stack>
        </Box>

        {/* Floating chat/bubble button for new alerts */}
        <Box position="fixed" bottom="22px" right="22px" zIndex={60}>
          {chatOpen && (
            <Box position="absolute" bottom="72px" right={0} w="320px" maxH="420px" overflowY="auto" bg={cardBg} boxShadow="lg" borderRadius="md" zIndex={70}>
              <Flex align="center" justify="space-between" p={3} borderBottomWidth={1} borderColor="gray.100">
                <Text fontWeight="semibold">Alerts</Text>
                <Flex align="center" gap={2}>
                  <Badge colorScheme="green">{newCount}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => { setChatOpen(false); markAsRead(filteredNewItems) }}>Close</Button>
                </Flex>
              </Flex>
              <Stack spacing={2} p={3}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" color="gray.500">Recent new items</Text>
                  <Button size="sm" variant="ghost" onClick={() => { markAsRead(filteredNewItems); }}>Mark all read</Button>
                </Flex>
                {filteredNewItems.map((it, i) => (
                  <Box key={i} p={2} bg={i === 0 ? 'green.50' : cardBg} borderRadius="md" boxShadow="sm">
                    {typeof it === 'string' || typeof it?.message === 'string' ? (
                      <Text fontSize="sm">{typeof it === 'string' ? it : it.message}</Text>
                    ) : (
                      <>
                        <Text fontSize="sm" fontWeight="semibold">{it.ProjectName || it.ListingType || 'Listing'}</Text>
                        <Text fontSize="xs" color="gray.500">ID: {it.PostID ?? it.row_number ?? '-'}</Text>
                        <Text mt={1} fontSize="sm">{String(it.RawText || it.Rawtext || it['RawText'] || '').slice(0, 140)}{String(it.RawText || it.Rawtext || it['RawText'] || '').length > 140 ? '…' : ''}</Text>
                      </>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Box position="relative">
            <IconButton
              aria-label="Open alerts chat"
              size="lg"
              colorScheme="purple"
              borderRadius="full"
              onClick={() => setChatOpen(s => !s)}
              icon={
                <Icon viewBox="0 0 24 24" boxSize={6}>
                  {/* robot icon */}
                  <path fill="currentColor" d="M12 2a2 2 0 00-2 2v1H8a2 2 0 00-2 2v2H5a1 1 0 000 2h1v2H5a1 1 0 000 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-3 6a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zM9 17a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2z" />
                </Icon>
              }
              sx={newCount > 0 ? { animation: `${pulse} 1.8s infinite` } : undefined}
            />
            {newCount > 0 && (
              <Badge position="absolute" top="-6px" right="-6px" borderRadius="full" colorScheme="red" fontSize="0.75em">{newCount}</Badge>
            )}
          </Box>
        </Box>

        <Text fontSize="lg" fontWeight="bold" mb={4}>🏠 Cleaned Property Listings</Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8} mt={6}>
          {pageItems.length === 0 && !loading ? (
            <Text color="gray.500">No listings</Text>
          ) : pageItems.map((l, idx) => {
            const id = Number(l.PostID || l.row_number || idx)
            const raw = String(l.RawText || l['RawText'] || l.Rawtext || '')
            const project = l.ProjectName || l['ProjectName'] || l['ProjectName\t'] || l.ProjectName || 'ไม่ระบุ'
            const excerpt = raw.length > 220 ? raw.slice(0, 220) + '…' : raw
            const isExpanded = expandedIds.includes(id)
            return (
              <Box key={id || idx} bg="white" borderRadius="xl" boxShadow="xl" p={6} animation={`${rise} 360ms ease`}>
                <Flex justifyContent="space-between" alignItems="start" mb={2}>
                  <Heading size="md">{project !== 'ไม่ระบุ' ? `${project}` : (l.ListingType ? `${l.ListingType} ${l.PropertyType || ''}` : 'Untitled')} {(() => {
                    const rn = Number(l.row_number || l.PostID || 0)
                    const isNew = rn && !Number.isNaN(rn) && (latestThreeIds.includes(rn) || rn >= highestRowNumber)
                    return isNew ? <Badge ml={2} colorScheme="green" fontSize="0.7em">New</Badge> : null
                  })()}</Heading>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Badge colorScheme={l.ListingType === 'Sale' ? 'red' : 'blue'}>{l.ListingType || 'N/A'}</Badge>
                    <Badge colorScheme="teal">{l.PropertyType || 'N/A'}</Badge>
                  </Stack>
                </Flex>

                <Box mb={2} display="flex" alignItems="center" gap={3}>
                  <Badge colorScheme={l.IsOwner ? 'green' : 'purple'}>{l.IsOwner ? 'Owner' : 'Agent'}</Badge>
                  <Text fontSize="sm" color="gray.500">ID: {l.PostID ?? 'N/A'}</Text>
                  {/* <Text fontSize="sm" color="gray.500">Row: {l.row_number ?? '-'}</Text> */}

                </Box>

                <Text mb={2} fontSize="lg"><strong>ราคา:</strong> {formatCurrency(l.CleanPrice)}</Text>
                <Text mb={3}><strong>โครงการ:</strong> {project}</Text>

                <Box mb={3}>
                  <Text fontSize="sm" color="gray.700">{isExpanded ? raw : (excerpt || '—')}</Text>
                  {raw && raw.length > 220 && (
                    <Button size="sm" mt={2} variant="link" onClick={() => toggleExpand(id)}>
                      {isExpanded ? 'ย่อข้อความ' : 'ขยายข้อความเต็ม'}
                    </Button>
                  )}
                </Box>

                <Flex gap={3} alignItems="center">
                  {l.URL ? (
                    <ChakraLink href={l.URL} isExternal color="brand.500" fontWeight="semibold">ดูประกาศฉบับเต็ม →</ChakraLink>
                  ) : (
                    <Text color="gray.400">ไม่มี URL ประกาศ</Text>
                  )}
                  <Tooltip label="Copy raw text">
                    <IconButton aria-label="Copy raw text" size="sm" icon={<Icon viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" /></Icon>} onClick={() => { navigator.clipboard?.writeText(raw || ''); setAlertLog(prev => [`Copied raw text for ${l.PostID || id}`, ...prev].slice(0, 5)) }} />
                  </Tooltip>
                </Flex>
              </Box>
            )
          })}
        </SimpleGrid>

        <Box mt={8} display="flex" justifyContent="center" gap={2} role="navigation" aria-label="Listing pagination">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>ก่อนหน้า</Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button key={i} size="sm" variant={i + 1 === page ? 'solid' : 'ghost'} onClick={() => setPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>ถัดไป</Button>
        </Box>

        {/* Modal for Test Now (mirrors dashboard.html) */}
        <Modal isOpen={modalOpen} onClose={closeModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Running Test</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box display="flex" alignItems="center" gap={4}>
                <Icon viewBox="0 0 24 24" boxSize={12}><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2" /></Icon>
                <Box>
                  <Text id="test-modal-body">{modalMsg || 'กำลังประมวลผล... กรุณารอสักครู่'}</Text>
                  <Text mt={2} fontSize="sm" color="gray.500">{countdown > 0 ? `${countdown}s remaining` : 'Ready'}</Text>
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => { fetchListings(); closeModal(); }}>Refresh Now</Button>
              <Button variant="ghost" onClick={closeModal}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
      <Footer />
    </Box>
  )
}
