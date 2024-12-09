import randomDateTime from "../../../randomDateTime.js"
import Util from "../../../Util.ts"

const rdt = (start) =>{ // random datetime iso format
  return randomDateTime(start || new Date(2024, 0, 1), new Date(2024, 10, 9)).toISOString()
}

const rd = (start) =>{
  return randomDateTime(start || new Date(start), new Date(2025, 10, 9)).toISOString().substring(0, 10)
}

const groups = [
  /*{
    id: 1,
    name: 'Weight Log',
    metric: 'mass',
    unit: 'kg',
    created: '2030-11-23T03:09:34.851Z'
  },*/
  {
    id: 2,
    name: '5k Run',
    metric: 'time',
    unit: 'duration',
    created: rdt()
  },
  {
    id: 3,
    name: 'Steps Log',
    metric: 'unit',
    unit: 'unit',
    created: rdt()
  },
  {
    id: 4,
    name: 'Spending Log',
    metric: 'currency',
    unit: '$',
    created: rdt()
  }
]

const groupById = (id) =>{
  return groups.find(x => x.id === id)
}

const RecordBuilders = {
  'Weight Log': () => [],
  '5k Run': () => generateRandomRecords(2, 49, 1300, -15, 10, true),
  'Steps Log': () => generateRandomRecords(3, 350, 7500, -50, 70, true),
  'Spending Log': () => generateRandomRecords(4, 365, 70, -0.5, 0.5, false)
}

function generateRandomRecords(groupId, n, seedValue, deltaMin, deltaMax, integer){
  const group = groupById(groupId)
  const records = []

  const startDate = randomDateTime(new Date(2023, 11, 31), new Date(2024, 5, 30))
  
  for (let i = 0; i < n ;i++){
    const prev = records[i-1]?.value ?? seedValue
    startDate.setDate(startDate.getDate() + 1)
    records.push({
      value: integer ? Math.round(prev + (Math.random() * (deltaMax-deltaMin) + deltaMin)) : prev + (Math.random() * (deltaMax-deltaMin) + deltaMin),
      date: Util.toISODate(startDate),
      created: rdt(new Date(group.created)),
      logGroupId: groupId
    })
  }
  return records
}

export async function seed(knex){
  await knex('logGroup').del()

  for (const group of groups){
    await knex('logGroup').insert(group)
    const records = RecordBuilders[group.name]()
    if (records.length == 0) continue
    await knex('logRecord').insert(records)
  }
}