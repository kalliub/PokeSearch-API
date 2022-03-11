/**
 * PokemonController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getPokemon: async (req, res) => {
    const pokemonName = String(req.param("name")).toLowerCase();
    const pokeApiUrl = "https://pokeapi.co/api/v2/";

    if (!pokemonName || pokemonName.length === 0) {
      return res.badRequest("Invalid pokemon");
    }

    // Getting data from PokeAPI
    let pokeApiRes = await sails.fetch(`${pokeApiUrl}/pokemon/${pokemonName}`);
    if (pokeApiRes.status === 404) {
      return res.status(404).json("Pokemon not found!");
    }
    if (pokeApiRes.status >= 300) {
      return res.serverError("There's a problem with the Pokemon Database");
    }

    pokeApiRes = await pokeApiRes.json();

    // Sorting Abilities
    const sortedAbilities = pokeApiRes.abilities;
    sortedAbilities.sort((a, b) => {
      if (a.ability.name < b.ability.name) {
        return -1;
      }
      return 1;
    });

    // Final JSON
    return res.ok({
      ...pokeApiRes,
      abilities: sortedAbilities,
    });
  },
};
