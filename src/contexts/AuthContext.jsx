import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

// ── Toast System ─────────────────────────────────────────────
let _toastId = 0
function useToastState() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = ++_toastId
    setToasts(prev => [...prev, { id, message, type, exiting: false }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280)
    }, 3500)
  }, [])

  return { toasts, addToast }
}

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined) // undefined = cargando
  const [isAdmin, setIsAdmin]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const { toasts, addToast }    = useToastState()
  const checkingRef             = useRef(false)

  const ALLOWED_DOMAIN = '@suzuval.cl'

  // Verifica si el email del usuario actual está en roles_admin
  const checkAdmin = useCallback(async (email) => {
    if (!email) return false
    const { data, error } = await supabase
      .from('roles_admin')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    if (error) return false
    return !!data
  }, [])

  // Procesa una sesión entrante
  const handleSession = useCallback(async (newSession) => {
    if (checkingRef.current) return
    checkingRef.current = true

    if (!newSession) {
      setSession(null)
      setIsAdmin(false)
      setLoading(false)
      checkingRef.current = false
      return
    }

    const email = newSession.user?.email ?? ''

    // Validar dominio
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      await supabase.auth.signOut()
      setSession(null)
      setIsAdmin(false)
      addToast('Acceso Denegado: Solo se admiten cuentas corporativas Suzuval (@suzuval.cl)', 'error')
      setLoading(false)
      checkingRef.current = false
      return
    }

    const admin = await checkAdmin(email)
    setSession(newSession)
    setIsAdmin(admin)
    setLoading(false)
    checkingRef.current = false
  }, [checkAdmin, addToast])

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // Escucha cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          hd: 'suzuval.cl', // hint para Google que muestre solo cuentas del dominio
        },
      },
    })
    if (error) addToast('Error al iniciar sesión: ' + error.message, 'error')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    addToast('Sesión cerrada correctamente', 'info')
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      isAdmin,
      loading,
      signInWithGoogle,
      signOut,
      toast: addToast,
      toasts,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
