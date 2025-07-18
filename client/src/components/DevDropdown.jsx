// components/DevDropdown.jsx
import { useState } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export default function DevDropdown() {
  const [open, setOpen] = useState(false);

  const deleteAllFromCollection = async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, collectionName, docSnap.id)));
    await Promise.all(deletePromises);
    alert(`Deleted all from ${collectionName}`);
  };

  const handleSeedFromCSV = async () => {
    const response = await fetch('/members-seed.csv');
    const text = await response.text();
    const rows = text.trim().split('\n').slice(1);

    const members = rows.map(row => {
      const [lastName, firstName, membershipStatus, temperature, reasonOrSolution, daysPerWeek, paymentOption, pricePoint, startDate, ninetyDayDate, referral, referralSecondMonth, referralMember, referralCoach, recurring, reactivation, notes, createdAt ] = row.split(',').map(col => col.trim());
      return { lastName, firstName, membershipStatus, temperature, reasonOrSolution, daysPerWeek, paymentOption, pricePoint, startDate, ninetyDayDate, referral, referralSecondMonth, referralMember, referralCoach, recurring, reactivation, notes, createdAt };
    });

    for (const member of members) {
      try {
        await addDoc(collection(db, 'members'), member);
      } catch (err) {
        console.error('Error adding member:', err, member);
      }
    }

    alert('Members seeded successfully!');
  };

  const handleDeleteAllMembers = async () => {
    const snapshot = await getDocs(collection(db, 'members'));
    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, 'members', docSnap.id))
    );
    await Promise.all(deletePromises);
    alert('All members deleted!');
  };

  const handleCleanMemberNames = async () => {
    const snapshot = await getDocs(collection(db, 'members'));

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const updatedFields = {};

      const clean = (str) =>
        str?.startsWith('"') || str?.endsWith('"')
          ? str.replace(/^"+|"+$/g, '')
          : str;

      const cleanedFirst = clean(data.firstName);
      const cleanedLast = clean(data.lastName);

      if (cleanedFirst !== data.firstName) updatedFields.firstName = cleanedFirst;
      if (cleanedLast !== data.lastName) updatedFields.lastName = cleanedLast;

      if (Object.keys(updatedFields).length > 0) {
        await updateDoc(doc(db, 'members', docSnap.id), updatedFields);
      }
    }

    alert('Member names cleaned successfully!');
  };

  const setHolds = async () => {
    const snapshot = await getDocs(collection(db, 'members'));

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const docRef = doc(db, 'members', docSnap.id);

      if (data.membershipStatus === "Green Hold") {
        const newHold = {
          startDate: Timestamp.now(),
          returnDate: null,
          nextContactDate: null,
          holdNotes: "Auto-added green hold"
        };

        await updateDoc(docRef, {
          holds: [...(data.holds || []), newHold],
          membershipStatus: "Hold"

        });

      } else if (data.membershipStatus === "Yellow Hold") {
        const newExtendedHold = {
          startDate: Timestamp.now(),
          returnDate: null,
          nextContactDate: null,
          holdNotes: "Auto-added yellow hold"
        };

        await updateDoc(docRef, {
          holds: [...(data.extendedHolds || []), newExtendedHold],
          membershipStatus: "Extended Hold"
        });
      }
    }
  };

  const convertSessionDatesToTimestamps = async () => {
    const snapshot = await getDocs(collection(db, 'sessionInstances'));
    const updates = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docRef = doc(db, 'sessionInstances', docSnap.id);

      if (typeof data.date === 'string') {
        try {
          const [year, month, day] = data.date.split('-');
          const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
          const timestamp = Timestamp.fromDate(dateObj);

          updates.push(updateDoc(docRef, { date: timestamp }));
        } catch (err) {
          console.error(`Failed to parse date for ${docSnap.id}`, err);
        }
      }
    });

    await Promise.all(updates);
    console.log('SessionInstances date fields converted to Timestamps!');
  }

  const clearAllAttendees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "sessionInstances"));
      const batch = writeBatch(db);

      snapshot.forEach((docSnap) => {
        const ref = doc(db, "sessionInstances", docSnap.id);
        batch.update(ref, { attendees: [] });
      });

      await batch.commit();
      console.log("✅ All attendees removed from sessionInstances.");
    } catch (error) {
      console.error("❌ Failed to clear attendees:", error);
    }
  };

  const generateMemberProfiles = async () => {
    const snapshot = await getDocs(collection(db, 'members'));
    const batch = writeBatch(db);

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const memberId = docSnap.id;

      const profileData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        membershipStatus: data.membershipStatus || null,
        temperature: data.temperature || null,
        startDate: data.startDate || null,
        daysPerWeek: data.daysPerWeek || null,
        paymentMethod: data.paymentOption || null,
        price: data.pricePoint || null,
        referral: data.referral || null,
        recurring: data.recurring || false,
        reactivation: data.reactivation || null,
        createdAt: Timestamp.now()
      };

      const profileRef = doc(db, 'memberProfiles', memberId);
      batch.set(profileRef, profileData);
    });

    await batch.commit();
    alert('✅ Member profiles generated!');
  };

  

  return (
    <div className="dev-actions">
      <button className="dev-button" onClick={() => setOpen(prev => !prev)}>
        Dev Actions ▾
      </button>
      {open && (
        <div className="dropdown dev-dropdown">
          <button onClick={() => deleteAllFromCollection('sessions')}>Delete All Sessions</button>
          <button onClick={() => deleteAllFromCollection('sessionInstances')}>Delete All Instances</button>
          <button onClick={handleSeedFromCSV}>Seed Members from CSV</button>
          <button onClick={handleDeleteAllMembers}>Delete All Members</button>
          <button onClick={handleCleanMemberNames}>Clean Member Names</button>
          <button onClick={setHolds}>Update Member Holds</button>
          <button onClick={convertSessionDatesToTimestamps}>Fix Instance Date Format</button>
          <button onClick={clearAllAttendees}>Remove All Attendees</button>
          <button onClick={generateMemberProfiles}>Generate Member Profiles</button>
        </div>
      )}
    </div>
  );
}
