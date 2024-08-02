"use client"; // Add this directive at the top
import styles from "./page.module.css";
import { Box, Stack, Typography, Button, TextField } from "@mui/material";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react"; // Import useEffect from React
import { db } from "../firebase"; // Adjust the import to use the correct export
import Modal from '@mui/material/Modal';
import { query } from "firebase/firestore";
require('dotenv').config()

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [filteredPantry, setFilteredPantry] = useState([]); // State for filtered pantry items

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  };

  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  const updatePantry = async () => {
    const pantryRef = query(collection(db, 'pantry'));
    const pantrySnapshot = await getDocs(pantryRef);
    const pantryList = [];
    pantrySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);
    setFilteredPantry(pantryList); // Update filtered pantry list
  }

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async () => {
    const quantity = parseInt(itemQuantity);
    if (!itemName || isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid item name and quantity");
      return;
    }

    const pantryRef = doc(collection(db, 'pantry'), itemName);
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(pantryRef, { count: count + quantity });
    } else {
      await setDoc(pantryRef, { count: quantity });
    }
    await updatePantry();
  }

  const removeItem = async (item) => {
    const pantryRef = doc(collection(db, 'pantry'), item);
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(pantryRef);
      } else {
        await setDoc(pantryRef, { count: count - 1 });
      }
    }
    await updatePantry();
  }

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredPantry(pantry);
    } else {
      const filteredItems = pantry.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPantry(filteredItems);
    }
  };

  useEffect(() => {
    setFilteredPantry(pantry);
  }, [pantry]);

  return (
    <Box className={styles.container}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.modalContainer}>
          <Typography id="modal-modal-title" className={styles.modalTitle} component="h2">
            Add Item
          </Typography>
          <Stack className={styles.modalStack}>
            <TextField id="item-name" label="Item" variant="outlined" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <TextField id="item-quantity" label="Quantity" variant="outlined" fullWidth value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} type="number" />
            <Button className={styles.modalButton}
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
      <Box className={styles.searchContainer}>
        <TextField 
          id="search-query" 
          label="Search" 
          variant="outlined" 
          fullWidth 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <Button 
          className={styles.searchButton} 
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
      <Button className={styles.addButton} onClick={handleOpen}>Add</Button>
      <Box className={styles.pantryBox}>
        <Box className={styles.pantryHeader}>
          <Typography className={styles.pantryTitle}>
            Pantry items
          </Typography>
        </Box>
        <Stack className={styles.pantryList}>
          {filteredPantry.map(({ name, count }) => (
            <Box className={styles.pantryItem} key={name}>
              <Typography className={styles.itemName}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography className={styles.itemCount}>
                Quantity: {count}
              </Typography>
              <Button className={styles.removeButton} onClick={() => removeItem(name)}>Remove</Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
