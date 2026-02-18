import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
let app;
try {
  // Try to use default credentials (if running in Firebase environment)
  app = initializeApp();
} catch (error) {
  console.log('Could not initialize with default credentials');
  console.error(error);
  process.exit(1);
}

const db = getFirestore();

const USER_ID = 'RSsBScaCEFUehXNUTq3RtQNILaD2';
const NOTIFICATION_ID = 'aVPvwXA5RSnPl2aXeb1Z';
const APP_ID = 'fitmanual-default';

async function checkDocuments() {
  console.log('\n========================================');
  console.log('VERIFICACIÓN DE DOCUMENTOS EN FIRESTORE');
  console.log('========================================\n');

  // 1. Check notification document
  console.log('1. Documento de Notificación:');
  console.log(`   Path: artifacts/${APP_ID}/users/${USER_ID}/notifications/${NOTIFICATION_ID}`);
  try {
    const notificationRef = db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('users')
      .doc(USER_ID)
      .collection('notifications')
      .doc(NOTIFICATION_ID);
    
    const notificationDoc = await notificationRef.get();
    
    if (notificationDoc.exists) {
      const data = notificationDoc.data();
      console.log('   ✅ Documento EXISTE');
      console.log('   Campos:');
      console.log(`     - title: ${data.title || 'NO DEFINIDO'} ${data.title ? '✅' : '❌'}`);
      console.log(`     - body: ${data.body || 'NO DEFINIDO'} ${data.body ? '✅' : '❌'}`);
      console.log(`     - url: ${data.url || 'NO DEFINIDO'} ${data.url ? '✅' : '❌'}`);
      console.log(`     - status: ${data.status || 'NO DEFINIDO'} ${data.status ? '✅' : '❌'}`);
      console.log(`     - sentAt: ${data.sentAt || 'NO DEFINIDO'} ${data.sentAt ? '✅' : '❌'}`);
      console.log(`     - createdAt: ${data.createdAt || 'NO DEFINIDO'}`);
    } else {
      console.log('   ❌ Documento NO EXISTE');
    }
  } catch (error) {
    console.log('   ❌ Error al leer:', error.message);
  }

  // 2. Check FCM tokens
  console.log('\n2. Tokens FCM:');
  console.log(`   Path: artifacts/${APP_ID}/users/${USER_ID}/fcm_tokens/`);
  try {
    const tokensRef = db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('users')
      .doc(USER_ID)
      .collection('fcm_tokens');
    
    const tokensSnapshot = await tokensRef.get();
    
    if (tokensSnapshot.empty) {
      console.log('   ❌ NO HAY TOKENS registrados');
    } else {
      console.log(`   ✅ ${tokensSnapshot.size} token(s) encontrado(s):`);
      tokensSnapshot.docs.forEach((doc, index) => {
        console.log(`     ${index + 1}. ${doc.id.substring(0, 30)}...`);
      });
    }
  } catch (error) {
    console.log('   ❌ Error al leer:', error.message);
  }

  // 3. Check profile document
  console.log('\n3. Documento de Perfil:');
  console.log(`   Path: artifacts/${APP_ID}/users/${USER_ID}/app_data/profile`);
  try {
    const profileRef = db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('users')
      .doc(USER_ID)
      .collection('app_data')
      .doc('profile');
    
    const profileDoc = await profileRef.get();
    
    if (profileDoc.exists) {
      const data = profileDoc.data();
      console.log('   ✅ Documento EXISTE');
      console.log('   Campos:');
      console.log(`     - email: ${data.email || 'NO DEFINIDO'} ${data.email ? '✅' : '❌'}`);
      console.log(`     - displayName: ${data.displayName || 'NO DEFINIDO'} ${data.displayName ? '✅' : '❌'}`);
      console.log(`     - pushEnabled: ${data.pushEnabled !== undefined ? data.pushEnabled : 'NO DEFINIDO'} ${data.pushEnabled !== undefined ? '✅' : '❌'}`);
      console.log(`     - emailOptOut: ${data.emailOptOut !== undefined ? data.emailOptOut : 'NO DEFINIDO'} ${data.emailOptOut !== undefined ? '✅' : '❌'}`);
      console.log(`     - createdAt: ${data.createdAt || 'NO DEFINIDO'}`);
      
      // Check if push is disabled
      if (data.pushEnabled === false) {
        console.log('   ⚠️  ADVERTENCIA: pushEnabled es false - las notificaciones push están desactivadas');
      }
      
      // Check if email is opted out
      if (data.emailOptOut === true) {
        console.log('   ⚠️  ADVERTENCIA: emailOptOut es true - el usuario ha optado por no recibir emails');
      }
    } else {
      console.log('   ❌ Documento NO EXISTE');
    }
  } catch (error) {
    console.log('   ❌ Error al leer:', error.message);
  }

  console.log('\n========================================\n');
}

checkDocuments().catch(console.error);
