"use client"; // Add this directive at the top
import { Box, Stack, Typography, Button, TextField} from "@mui/material";
import { collection, getDocs,doc,setDoc,deleteDoc,getDoc } from "firebase/firestore";
import { useEffect, useState } from "react"; // Import useEffect from React
import { db } from "../firebase"; // Adjust the import to use the correct export
import Modal from '@mui/material/Modal';
import { query } from "firebase/firestore";
require('dotenv').config()


export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  };
  const [itemname, setItemname] = useState('');
  const updatePantry = async () => {
      const pantryRef = query(collection(db, 'pantry'));
      const pantrySnapshot = await getDocs(pantryRef);
      const pantryList = []
      pantrySnapshot.forEach((doc) => {
        pantryList.push({name:doc.id, ...doc.data()})
      });
      console.log(pantryList)
      setPantry(pantryList)

    }
  useEffect(() => {
    updatePantry()
  }, []
  )
  const addItem = async () => {
    const pantryRef = doc(collection(db, 'pantry'), itemname)
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(pantryRef, {count: count + 1})
    }else{
      await setDoc(pantryRef, {count: 1})
    }
    await updatePantry()
  }
  const removeItem = async (item) => {
    const pantryRef = doc(collection(db, 'pantry'), item)
    const docSnap = await getDoc(pantryRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if (count === 1){
        await deleteDoc(pantryRef)
      }else{
        await setDoc(pantryRef, {count: count - 1})
      }
    }
    await updatePantry()
  }
  return (
    <Box
      width= "100vw" 
      height= "100vh"
      display= {"flex"} 
      justifyContent= {"center"}
      alignItems= {"center"}
      flexDirection= {"column"}
      gap={2}

    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={"row"} spacing={2} width={"100%"}>
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth value={itemname} onChange={(e) => setItemname(e.target.value)}/>
            <Button variant="contained"
            onClick={() =>{
              addItem(itemname)
              setItemname('')
              handleClose()
              
            }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Box 
        border= {"1px solid #333"}
      >
        <Box
          width={"800px"} 
          height={"100px"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"} 
          bgcolor={"#90EE90"}
          border={"1px solid #333"}
          >
            <Typography variant={"h1"} color={'#333'} textAlign={'center'}>
              Pantry items
            </Typography>
        </Box>
        <Stack width={"800px"} height={"200px"} spacing={2} overflow={'auto'}>
          {pantry.map(({name, count}) => (
            <Box
              key={name}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              width={"100%"}
              height={"100%"}
              bgcolor={"#f0f0f0"}
              paddingX={5}
            >
              <Typography variant={"h3"} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={"h3"} color={'#333'} textAlign={'center'}>
                Quantity:{count}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
              
            </Box>
          ))}

        </Stack>
      </Box>
    </Box>
  )
}
