"use client";
import styles from "./recipes.module.css";
import { Box, Button, Typography, MenuItem, Select, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import SidebarLayout from "../components/SidebarLayout";
import { useAuth } from "../contexts/authContext";
import { useEffect, useState } from "react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from '../firebase/firebase';

export default function Recipes() {
  const router = useRouter();
  const { currentUser, userLoggedIn } = useAuth();
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');

  // For dropdown selection
  const [selectedCuisine, setSelectedCuisine] = useState('Italian');
  const [customCuisine, setCustomCuisine] = useState('');
  const [isOtherCuisine, setIsOtherCuisine] = useState(false); // To show custom input if "Others" selected

  useEffect(() => {
    if (!userLoggedIn) {
      router.push('/'); // Redirect to login if not logged in
    }
  }, [userLoggedIn, router]);

  const fetchPantryItems = async () => {
    const pantryItems = [];
    if (currentUser) {
      const userPantryRef = collection(db, 'users', currentUser.uid, 'pantry');
      const pantrySnapshot = await getDocs(userPantryRef);
      pantrySnapshot.forEach((doc) => {
        const { count } = doc.data();
        pantryItems.push({ name: doc.id, count });
      });
    }
    return pantryItems;
  };

  const handleGenerateFromPantry = async () => {
    setLoading(true);
    try {
      const pantryItems = await fetchPantryItems();
      const ingredients = pantryItems.map(item => `${item.count}x ${item.name}`);

      const response = await fetch('pages/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          usePantryOnly: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
        const firstLine = data.recipe.split('\n')[0];
        setRecipeTitle(firstLine.replace('Recipe:', '').trim());
      } else {
        console.error('Error generating recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnyRecipe = async () => {
    setLoading(true);
    try {
      const cuisine = isOtherCuisine ? customCuisine : selectedCuisine; // Use custom cuisine if selected

      const response = await fetch('pages/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: [],
          usePantryOnly: false,
          cuisine, // Send the selected or entered cuisine to the API
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
        const firstLine = data.recipe.split('\n')[0];
        setRecipeTitle(firstLine.replace('Recipe:', '').trim());
      } else {
        console.error('Error generating recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract fields from the generated recipe content
  const extractRecipeFields = (recipeContent) => {
    const difficultyMatch = recipeContent.match(/Difficulty:\s*(.*)/);
    const timeMatch = recipeContent.match(/Time:\s*(.*)/);
    const servingsMatch = recipeContent.match(/Servings:\s*(.*)/);
    const ingredientsMatch = recipeContent.match(/Ingredients:\n([\s\S]*?)\nInstructions:/);
    const instructionsMatch = recipeContent.match(/Instructions:\n([\s\S]*)/);

    const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'N/A';
    const time = timeMatch ? timeMatch[1].trim() : 'N/A';
    const servings = servingsMatch ? servingsMatch[1].trim() : 'N/A';
    const ingredients = ingredientsMatch ? ingredientsMatch[1].trim().split('\n') : [];
    const instructions = instructionsMatch ? instructionsMatch[1].trim().split('\n') : [];

    return { difficulty, time, servings, ingredients, instructions };
  };

  const handleSaveRecipe = async () => {
    if (!currentUser || !recipe) {
      alert("No recipe to save or user not authenticated.");
      return;
    }

    setSaveLoading(true);
    try {
      // Extract fields from the recipe content
      const { difficulty, time, servings, ingredients, instructions } = extractRecipeFields(recipe);

      const recipeRef = doc(collection(db, 'users', currentUser.uid, 'recipes'), recipeTitle);
      await setDoc(recipeRef, {
        title: recipeTitle,
        difficulty,
        time,
        servings,
        ingredients,
        instructions,
        timestamp: new Date(),
      });
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save the recipe. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <Box className={styles.recipesContainer}>
        <Typography variant="h4" textAlign={"center"} className={styles.recipesTitle}>
          Recipes
        </Typography>
        <Box className={styles.buttonsContainer}>
          <Button
            variant="contained"
            className={styles.generateButton}
            onClick={handleGenerateFromPantry}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Recipe from Pantry'}
          </Button>

          {/* Dropdown for selecting cuisine */}
          <Box sx={{ marginTop: 2 }}>
            <Typography>Select a Cuisine:</Typography>
            <Select
              value={selectedCuisine}
              onChange={(e) => {
                setSelectedCuisine(e.target.value);
                setIsOtherCuisine(e.target.value === 'Others');
                setCustomCuisine(''); // Clear custom cuisine when switching
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="Italian">Italian</MenuItem>
              <MenuItem value="Mexican">Mexican</MenuItem>
              <MenuItem value="Chinese">Chinese</MenuItem>
              <MenuItem value="Indian">Indian</MenuItem>
              <MenuItem value="French">French</MenuItem>
              <MenuItem value="Thai">Thai</MenuItem>
              <MenuItem value="Japanese">Japanese</MenuItem>
              <MenuItem value="Greek">Greek</MenuItem>
              <MenuItem value="American">American</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>

            {isOtherCuisine && (
              <TextField
                label="Enter your Cuisine"
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                sx={{ marginTop: 2 }}
                fullWidth
              />
            )}

            <Button
              variant="contained"
              className={styles.generateButton}
              onClick={handleGenerateAnyRecipe}
              disabled={loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? 'Generating...' : 'Generate Recipe'}
            </Button>
          </Box>
        </Box>

        {/* Display Generated Recipe */}
        {recipe && (
          <Box className={styles.recipeContainer}>
            <Typography variant="h5" className={styles.recipeTitle}>
              Generated Recipe: {recipeTitle}
            </Typography>
            <Typography variant="body1" className={styles.recipeContent}>
              {recipe}
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveRecipe}
              disabled={saveLoading}
              className={styles.saveButton}
            >
              {saveLoading ? 'Saving...' : 'Save Recipe'}
            </Button>
          </Box>
        )}
      </Box>
    </SidebarLayout>
  );
}
