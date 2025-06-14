
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Clock, Users, ChefHat, ArrowLeft, Check } from 'lucide-react';

const RecipeDetail = () => {
  const { slug } = useParams();
  
  // Mock Rezept-Daten
  const recipe = {
    title: 'Saftige Zucchini-Muffins',
    description: 'Gesunde Muffins mit Zucchini aus dem eigenen Garten - perfekt für den Nachmittagskaffee. Diese saftigen Muffins sind nicht nur lecker, sondern auch eine tolle Möglichkeit, überschüssige Zucchini aus dem Garten zu verwerten.',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=1200&h=600&fit=crop',
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    servings: 12,
    difficulty: 'einfach',
    category: 'Süßes & Kuchen',
    ingredients: [
      { name: 'Zucchini, geraspelt', amount: 200, unit: 'g' },
      { name: 'Mehl', amount: 300, unit: 'g' },
      { name: 'Zucker', amount: 150, unit: 'g' },
      { name: 'Eier', amount: 2, unit: 'Stück' },
      { name: 'Öl', amount: 100, unit: 'ml' },
      { name: 'Backpulver', amount: 2, unit: 'TL' },
      { name: 'Vanilleextrakt', amount: 1, unit: 'TL' },
      { name: 'Salz', amount: 1, unit: 'Prise' }
    ],
    instructions: [
      'Ofen auf 180°C vorheizen. Muffinformen fetten oder mit Papierförmchen auslegen.',
      'Zucchini waschen, putzen und fein raspeln. Überschüssige Flüssigkeit ausdrücken.',
      'In einer großen Schüssel Mehl, Zucker, Backpulver und Salz vermischen.',
      'In einer weiteren Schüssel Eier, Öl und Vanilleextrakt verrühren.',
      'Die feuchten Zutaten zu den trockenen geben und vorsichtig unterrühren.',
      'Geraspelte Zucchini unter den Teig heben.',
      'Teig in die Muffinformen füllen (etwa 2/3 voll).',
      'Für 20-25 Minuten backen, bis die Muffins goldbraun sind.',
      'Kurz abkühlen lassen, dann aus der Form nehmen.'
    ],
    tips: [
      'Die Zucchini nicht schälen - die Schale enthält wertvolle Nährstoffe',
      'Für extra Geschmack: Eine Handvoll Walnüsse oder Schokoladentropfen hinzufügen',
      'Die Muffins halten sich in einer luftdichten Dose 3-4 Tage frisch'
    ]
  };

  return (
    <Layout title={`${recipe.title} - Rezepte`}>
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link
          to="/rezepte"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu den Rezepten
        </Link>
      </div>

      <article className="max-w-6xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="mb-4">
              <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
                {recipe.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
              {recipe.title}
            </h1>
            
            <p className="text-xl text-earth-600 mb-8">
              {recipe.description}
            </p>
            
            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-sage-50 rounded-lg p-4 text-center">
                <Clock className="h-6 w-6 text-sage-600 mx-auto mb-2" />
                <div className="text-sm text-earth-500">Gesamtzeit</div>
                <div className="font-semibold text-earth-800">{recipe.totalTime} Min</div>
              </div>
              <div className="bg-sage-50 rounded-lg p-4 text-center">
                <Users className="h-6 w-6 text-sage-600 mx-auto mb-2" />
                <div className="text-sm text-earth-500">Portionen</div>
                <div className="font-semibold text-earth-800">{recipe.servings}</div>
              </div>
              <div className="bg-sage-50 rounded-lg p-4 text-center">
                <ChefHat className="h-6 w-6 text-sage-600 mx-auto mb-2" />
                <div className="text-sm text-earth-500">Schwierigkeit</div>
                <div className="font-semibold text-earth-800 capitalize">{recipe.difficulty}</div>
              </div>
            </div>
          </div>
          
          <div>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        </header>

        {/* Recipe Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-earth-800 mb-6">
                Zutaten
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                    </div>
                    <span className="text-earth-700">
                      {ingredient.amount && ingredient.unit && (
                        <strong>{ingredient.amount} {ingredient.unit}</strong>
                      )} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-6">
              Zubereitung
            </h2>
            <ol className="space-y-6">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex">
                  <div className="w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-earth-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>

            {/* Tips */}
            {recipe.tips && recipe.tips.length > 0 && (
              <div className="mt-12 bg-accent-50 rounded-xl p-6">
                <h3 className="text-xl font-serif font-bold text-earth-800 mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Tipps & Tricks
                </h3>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-sage-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-earth-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-sage-200">
          <div className="bg-sage-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">
              Hat dir dieses Rezept gefallen?
            </h3>
            <p className="text-earth-600 mb-6">
              Teile es mit deinen Freunden und lass dich von weiteren saisonalen Rezepten inspirieren!
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors">
                Bei Pinterest merken
              </button>
              <button className="bg-earth-600 text-white px-6 py-2 rounded-full hover:bg-earth-700 transition-colors">
                Auf Facebook teilen
              </button>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default RecipeDetail;
