import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { ingredients, usePantryOnly, cuisine } = await req.json();

    const randomSeed = Math.floor(Math.random() * 1000000);
    const randomAdjective = ['delicious', 'tasty', 'mouthwatering', 'appetizing', 'flavorful'][Math.floor(Math.random() * 5)];

    let prompt = usePantryOnly
      ? `Generate a unique and creative ${randomAdjective} recipe using ONLY these ingredients: ${ingredients}. Be innovative and make something even if there are limited ingredients. If it's absolutely impossible, respond with ONLY the text "Not enough ingredients". Otherwise, follow the format specified below exactly.`
      : `Generate a unique and creative ${randomAdjective} ${cuisine} recipe. You can use ingredients not listed here. Ensure the recipe is completely different from any previous ones. Follow the format specified below exactly.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a creative AI chef assistant that generates unique and diverse recipes. Always use the exact format provided, without any deviations:\n\nRecipe: [Recipe Name]\nDifficulty: [Easy/Medium/Hard]\nTime: [Preparation and Cooking Time]\nServings: [Number of Servings]\n\nIngredients:\n• [Ingredient 1]\n• [Ingredient 2]\n...\n\nInstructions:\n1. [Step 1]\n2. [Step 2]\n...\n\nNever use asterisks or any other symbols. Always include all sections, especially the instructions.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 1.0,
      max_tokens: 750,
      top_p: 1,
      seed: randomSeed,
    });

    const recipe = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a recipe at this time.';

    if (!recipe.includes('Recipe:') || !recipe.includes('Ingredients:') || !recipe.includes('Instructions:')) {
      throw new Error('Invalid recipe format');
    }

    return new Response(JSON.stringify({ recipe }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while generating the recipe. Please try again later.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
