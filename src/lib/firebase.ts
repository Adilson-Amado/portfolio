import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Singleton helper to get data
export async function getPortfolioData() {
  const collections = ['servicos', 'projectos', 'metricas', 'depoimentos', 'contactos', 'sectores', 'pais', 'ferramentas'];
  const data: any = {};
  
  // Perfil
  const x = await getDoc(doc(db, 'perfil', 'principal'));
  data.perfil = x.exists() ? x.data() : null;

  // Global Config
  const y = await getDoc(doc(db, 'configuracoes', 'global'));
  data.config = y.exists() ? y.data() : null;

  return data;
}

export function subscribeToCollection(colName: string, callback: (data: any[]) => void) {
  const q = query(collection(db, colName), orderBy('ordem', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
}

export async function login() {
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  return signOut(auth);
}
