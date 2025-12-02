import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const useProfile = (user) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'app_data', 'profile');
    
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Perfil por defecto
        setProfile({
          weight: '',
          height: '',
          age: '',
          gender: 'male',
          experienceLevel: 'intermediate', // beginner, intermediate, advanced
          goal: 'muscle_gain', // muscle_gain, fat_loss, strength, endurance
          availableDays: 3,
          dailyTimeMinutes: 60, // Tiempo disponible por sesión en minutos
          equipment: 'gym_full', // gym_full, dumbbells_only, bodyweight, home_gym
          injuries: ''
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching profile:", err);
      setError("Error cargando perfil");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveProfile = async (profileData) => {
    if (!user || !db) return false;
    try {
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'app_data', 'profile');
      await setDoc(profileRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Error guardando perfil");
      return false;
    }
  };

  return { profile, loading, error, saveProfile };
};
