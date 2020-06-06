import Knex from 'knex';

export async function seed(knex:Knex){
  return knex('items').insert([
    {title: 'Light Bulbs', image: 'lampadas.svg'},
    {title: 'Batteries', image: 'baterias.svg'},
    {title: 'Cardboard and Boxboard', image: 'papeis-papelao.svg'},
    {title: 'Electronics', image: 'eletronicos.svg'},
    {title: 'Organics', image: 'organicos.svg'},
    {title: 'Cooking Oil', image: 'oleo.svg'},
  ]);
}