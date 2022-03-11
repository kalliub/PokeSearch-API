/**
 * PokemonController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getPokemon: async (req, res) => {
    const pokemonName = String(req.param("name")).toLowerCase();
    const pokeApiUrl = "https://pokeapi.co/api/v2";

    if (!pokemonName || pokemonName.length === 0) {
      return res.badRequest("Invalid pokemon");
    }

    // Getting data from PokeAPI
    let pokemonData = await sails.fetch(`${pokeApiUrl}/pokemon/${pokemonName}`);
    if (pokemonData.status === 404) {
      return res.status(404).json("Pokemon not found!");
    }
    if (pokemonData.status >= 300) {
      return res.serverError("There's a problem with the Pokemon Database");
    }

    pokemonData = await pokemonData.json();

    // Getting items details
    const pokemonItems = pokemonData.held_items;
    const itemsData = await Promise.all(
      pokemonItems.map(async ({ item }) => {
        return sails.fetch(item.url).then((r) => r.json());
      })
    );

    // Sorting Abilities
    const sortedAbilities = pokemonData.abilities;
    sortedAbilities.sort((a, b) => {
      if (a.ability.name < b.ability.name) {
        return -1;
      }
      return 1;
    });

    // Final JSON
    return res.ok({
      ...pokemonData,
      abilities: sortedAbilities,
      held_items: itemsData,
    });
  },
};
