import { Router } from "express"
import connection from "../db/connection"
import { ILogGroup } from "../../models/classes/LogGroup"
import { ILogRecord } from "../../models/classes/LogRecord"
import * as fs from 'node:fs/promises'
import ProblemDetails from "../ProblemDetails"
import Dict from "../../models/Dict"

const snapshotRouter = Router()


type SnapGroup = ILogGroup & {logRecords: Array<ILogRecord>}
type Snapshot = Array<SnapGroup>

const snapshotPath = './server/snapshots'

async function createSnapshot(): Promise<Snapshot>{
  const groupMap = new Map<number, SnapGroup>()
  const snapshot: Snapshot = []
  const groups = await connection<ILogGroup>('logGroup')
  for (const group of groups){
    snapshot.push({
      ...group,
      logRecords: []
    })
    groupMap.set(group.id, snapshot[snapshot.length - 1])
  }

  const records = await connection<ILogRecord>('logRecord')
  for (const record of records){
    groupMap.get(record.logGroupId)?.logRecords.push(record)
  }

  const filePath = `${snapshotPath}/snapshot_${Date.now()}`

  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2))

  return snapshot
}

async function loadSnapshot(fileName: string): Promise<Snapshot>{
  try{
    const jsonString = await fs.readFile(`${snapshotPath}/${fileName}`, {encoding: 'utf8'})

    return JSON.parse(jsonString) as Snapshot
  } catch (e){
    throw ProblemDetails.UserError('Snapshot does not exist')
  }
  
  
}

/*(async function(){
  const files = await fs.readdir(snapshotPath)
  if (files.length === 0){
    console.log("Creating snapshot")
    return createSnapshot()
  }

  const last = files.at(-1)!

  const now = Date.now()
  const snapTime = Number(last.substring(9))
  
  if ((now - snapTime) / 3_600_000 >= 24){
    console.log("Creating snapshot")
    createSnapshot()
  }
})()*/


snapshotRouter.get('/', async (req, res) =>{
  await createSnapshot()
  res.sendStatus(200)
})

interface ILoadSnapshot{
  snapshotId: string
  createNewIds?: boolean
}

function createInsert(tableName: string, columns: Array<string>, arr: Array<object>){

  let query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES `
  for (let i = 0; i < arr.length; i++){
    query += '('
    const obj = arr[i] as Dict
    for (let j = 0; j < columns.length; j++){
      const key = columns[j]
      const value = obj[key]
      query += (typeof(value) === 'string' ? `"${value}"` : `${value}`) 
      query += (j + 1 === columns.length ? '' : ',')
    }
    query += ')'
    query += (i + 1 === arr.length ? ';' : ',')
  }
  return query
}

snapshotRouter.post('/', async (req, res) =>{
  const body: ILoadSnapshot = req.body

  const snapshot = await loadSnapshot(body.snapshotId)

  for (const snapGroup of snapshot){
    if (!body.createNewIds)
      await connection('logGroup').delete().where({id: snapGroup.id})

    const result = await connection('logGroup').insert({
      id: body.createNewIds ? undefined : snapGroup.id,
      created: snapGroup.created,
      metric: snapGroup.metric,
      name: snapGroup.name,
      unit: snapGroup.unit
    }, 'id')

    //console.log(result)

    const queryRecords = snapGroup.logRecords.map(lr =>{
      return {
        value: lr.value,
        created: lr.created,
        logGroupId: result[0].id,
        date: lr.date
      }
    })//.slice(0, 5)

    const insertStatement = createInsert('logRecord', ['value', 'created', 'logGroupId', 'date'], queryRecords)

    await connection.raw(insertStatement)
    /*const query = await connection('logRecord').insert(snapGroup.logRecords.map(lr =>{
      return {
        value: lr.value,
        created: lr.created,
        logGroupId: result[0].id,
        date: lr.date
      }
    }).slice(0, 5)).toQuery()*/

    //console.log(createInsert('logRecord', ['value', 'created', 'logGroupId', 'date'], queryRecords))
  }

  res.sendStatus(200)
})



export default snapshotRouter