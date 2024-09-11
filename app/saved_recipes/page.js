"use client";
import { Box, Button, Card, CardContent, Typography, Modal } from "@mui/material";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { useAuth } from "../contexts/authContext";
import SidebarLayout from "../components/SidebarLayout";
import styles from "./saved_recipes.module.css";

export default function SavedRecipes() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (recipe) => {
    setSelectedRecipe(recipe);
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);

  // Fetch saved recipes from Firestore
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (currentUser) {
        const userRecipesRef = collection(db, 'users', currentUser.uid, 'recipes');
        const recipeSnapshot = await getDocs(userRecipesRef);
        const savedRecipes = [];
        recipeSnapshot.forEach((doc) => {
          savedRecipes.push({ id: doc.id, ...doc.data() });
        });
        setRecipes(savedRecipes);
      }
    };

    fetchSavedRecipes();
  }, [currentUser]);

  return (
    <SidebarLayout>
      <Box className={styles.recipesContainer}>
        {recipes.length === 0 ? (
          <Typography variant="h6">No saved recipes found.</Typography>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id} className={styles.recipeCard}>
              <CardContent>
                <Typography variant="h5" className={styles.cardTitle}>
                  {recipe.title || "Untitled Recipe"}
                </Typography>
                <Typography className={styles.cardSubtitle}>
                  Difficulty: {recipe.difficulty || "N/A"}
                </Typography>
                <Typography className={styles.cardSubtitle}>
                  Time: {recipe.time || "N/A"}
                </Typography>
                <Typography className={styles.cardSubtitle}>
                  Servings: {recipe.servings || "N/A"}
                </Typography>
                <Button
                  variant="contained"
                  className={styles.viewRecipeButton}
                  onClick={() => handleOpen(recipe)}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {/* Recipe Details Modal */}
        {/* Recipe Details Modal */}
        <Modal open={open} onClose={handleClose}>
        <Box className={styles.recipeModal}>
            {selectedRecipe && (
            <>
                <Typography className={styles.modalTitle}>
                {selectedRecipe.title}
                </Typography>
                <Typography className={styles.recipeContents}>
                <strong>Difficulty:</strong> {selectedRecipe.difficulty || "N/A"}
                </Typography>
                <Typography className={styles.recipeContents}>
                <strong>Time:</strong> {selectedRecipe.time || "N/A"}
                </Typography>
                <Typography className={styles.recipeContents}>
                <strong>Servings:</strong> {selectedRecipe.servings || "N/A"}
                </Typography>
                <Typography className={styles.recipeContents}>
                <strong>Ingredients:</strong>
                </Typography>
                <Typography variant="body1" className={styles.recipeContents}>
                {selectedRecipe.ingredients?.join('\n')}
                </Typography>
                <Typography className={styles.recipeContents}>
                <strong>Instructions:</strong>
                </Typography>
                <Typography variant="body1" className={styles.recipeContents}>
                {selectedRecipe.instructions?.join('\n')}
                </Typography>
            </>
            )}
        </Box>
        </Modal>

      </Box>
    </SidebarLayout>
  );
}
