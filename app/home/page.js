"use client";
import styles from "./home.module.css";
import { Box, Stack, Typography, Button, TextField, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../contexts/authContext';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import SidebarLayout from "../components/SidebarLayout";

export default function Home() {
  const { currentUser, userLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userLoggedIn) {
      router.push('/'); // Redirect to login if not logged in
    }
  }, [userLoggedIn, router]);

  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPantry, setFilteredPantry] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  const updatePantry = async () => {
    if (!currentUser) return;

    const userPantryRef = collection(db, 'users', currentUser.uid, 'pantry');
    const pantrySnapshot = await getDocs(userPantryRef);
    const pantryList = [];
    pantrySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, [currentUser]);

  const addItem = async () => {
    if (!currentUser) return;

    const quantity = parseInt(itemQuantity);
    if (!itemName || isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid item name and quantity");
      return;
    }

    const pantryRef = doc(collection(db, 'users', currentUser.uid, 'pantry'), itemName);
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(pantryRef, { count: count + quantity, userId: currentUser.uid });
    } else {
      await setDoc(pantryRef, { count: quantity, userId: currentUser.uid });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    if (!currentUser) return;

    const pantryRef = doc(collection(db, 'users', currentUser.uid, 'pantry'), item);
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(pantryRef);
      } else {
        await setDoc(pantryRef, { count: count - 1, userId: currentUser.uid });
      }
    }
    await updatePantry();
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const quantity = itemQuantity.trim();

    if (query === '' && quantity === '') {
      setFilteredPantry(pantry); // Show all items if both fields are empty
      return;
    }

    const filteredItems = pantry.filter(item => {
      const matchesName = query ? item.name.toLowerCase().includes(query) : true;
      const matchesQuantity = quantity ? item.count === parseInt(quantity) : true;
      return matchesName && matchesQuantity;
    });

    setFilteredPantry(filteredItems);
  };

  useEffect(() => {
    setFilteredPantry(pantry);
  }, [pantry]);

  return (
    <SidebarLayout>
      <Box className={styles.container}>
        <Typography variant="h2" textAlign="center" className={styles.title}>
          Inventory Management
        </Typography>

        {/* Search and Add Item Section */}
        <Box className={styles.actionSection}>
          <Box className={styles.searchContainer}>
            <Typography variant="h5">Search Items</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
            </Stack>
          </Box>

          <Box className={styles.addItemContainer}>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Add New Item
            </Button>
          </Box>
        </Box>

        {/* Pantry Items List */}
        <Box className={styles.pantryListSection}>
          <Typography variant="h5" className={styles.sectionTitle}>
            Pantry Items
          </Typography>
          <Stack className={styles.pantryList}>
            {filteredPantry.map(({ name, count }) => (
              <Box className={styles.pantryItem} key={name}>
                <Typography>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Typography>Quantity: {count}</Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Modal for Adding New Item */}
        <Modal open={open} onClose={handleClose}>
          <Box className={styles.modalContainer}>
            <Typography variant="h6">Add Item</Typography>
            <Stack spacing={2}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem();
                  setItemName('');
                  setItemQuantity('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </SidebarLayout>
  );
}
