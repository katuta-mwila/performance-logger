import UnitConverters from "./BaseConverters"
import roundToX from "../../client/roundToX"

export type BaseConverter = (x: string) => (number | null)
export type FromBaseConverter = (x: number) => string

class Unit{
  metric: Metric
  alias: string
  code: string
  convertToBase: BaseConverter
  constructor(metric: Metric, alias: string, code: string, convertToBase: BaseConverter){
    this.metric = metric
    this.alias = alias
    this.convertToBase = convertToBase
    this.code = code
  }
}

class BaseUnit extends Unit{
  converters: Map<string, (x: number) => string>
  constructor(metric: Metric, alias: string, code: string){
    super(metric, alias, code, UnitConverters.Identity.toBase)
    this.converters = new Map()
  }
}

class Metric{
  units: Map<string, Unit>
  baseUnit: string
  alias: string

  constructor(baseUnit: string, alias: string){
    this.units = new Map<string, Unit>()
    this.baseUnit = baseUnit
    this.alias = alias
  }

  getBase(){
    return this.units.get(this.baseUnit)! as BaseUnit
  }
}

class MetricBuilder{
  metrics: Map<string, Metric>

  constructor(){
    this.metrics = new Map<string, Metric>()
  }
}

export const MetricHandler = (function(){
  const builder = new MetricBuilder()

  const length = new Metric('M', 'Length')
  const metre = length.units.set('cm', new Unit(length, 'Centimeter', 'cm', UnitConverters.cm.toBase))
              .set('M', new BaseUnit(length, 'Meter', 'm'))
              .set('km', new Unit(length, 'Kilometer', 'km', UnitConverters.km.toBase))
              .set('mi', new Unit(length, 'Mile', 'mi', UnitConverters.mi.toBase))
              .set('ft', new Unit(length, 'Feet', 'ft', UnitConverters.ft.toBase))
              .get('M') as BaseUnit
  metre.converters.set('cm', UnitConverters.cm.fromBase)
                  .set('km', UnitConverters.km.fromBase)
                  .set('M', UnitConverters.Identity.fromBase)
                  .set('mi', UnitConverters.mi.fromBase)
                  .set('ft', UnitConverters.ft.fromBase)

  const mass = new Metric('kg', 'Weight')
  const kg = mass.units.set('kg', new BaseUnit(mass, 'Kilogram', 'kg'))
            .set('g', new Unit(mass, 'Gram', 'g', UnitConverters.g.toBase))
            .set('lb', new Unit(mass, 'Pound', 'lb', UnitConverters.lb.toBase))
            .get('kg') as BaseUnit
  kg.converters.set('kg', UnitConverters.Identity.fromBase)
               .set('g', UnitConverters.g.fromBase)
               .set('lb', UnitConverters.lb.fromBase)
  
  const time = new Metric('s', 'Time')
  const seconds = time.units.set('s', new BaseUnit(time, 'Seconds', 's'))
                  .set('duration', new Unit(time, 'hh:mm:ss', 'hh:mm:ss', UnitConverters.duration.toBase))
                  .get('s') as BaseUnit
  seconds.converters.set('s', UnitConverters.seconds.fromBase)
                    .set('duration', UnitConverters.duration.fromBase)
  seconds.convertToBase = UnitConverters.seconds.toBase

  const currency = new Metric('$', 'Currency')
  const dollars = currency.units.set('$', new BaseUnit(currency, 'Dollars', '$'))
                  .get('$') as BaseUnit
  dollars.converters.set('$', UnitConverters.$.fromBase)

  const unit = new Metric('unit', 'Unit')
  const baseUnit = unit.units.set('unit', new BaseUnit(unit, 'Unit', 'units')).get('unit') as BaseUnit
  baseUnit.converters.set('unit', UnitConverters.Identity.fromBase)

  builder.metrics.set('length', length).set('mass', mass).set('time', time).set('currency', currency).set('unit', unit)
  
  const convertTo = function(fromMetricCode: string, fromUnitCode: string, toMetricCode: string, toUnitCode: string, value: string, dp: number = 4){

    const fromMetric = builder.metrics.get(fromMetricCode)
    const fromUnit = fromMetric?.units.get(fromUnitCode)
    const toMetric = builder.metrics.get(toMetricCode)
    const toUnit = toMetric?.units.get(toUnitCode)

    if (!fromMetric || !fromUnit || !toMetric || !toUnit)
      throw new Error('One of the metrics or units is invalid')

    const baseValue = fromUnit.convertToBase(value)

    if (baseValue == null){
      console.error(`Cannot convert value ${value} from ${fromMetricCode}(${fromUnitCode}) to ${toMetricCode}(${toUnitCode})`)
      return null
    }
    //console.log(toMetricCode, toUnitCode, toMetric)

    const converterFn = toMetric.getBase().converters.get(toUnitCode)!

    const final = converterFn(baseValue)

    if (toMetricCode !== 'currency' && final !== '' && !isNaN(Number(final)))
      return roundToX(Number(final), dp).toString()//Number(final).toFixed(dp)
    return final
  }

  const convertToBase = (metric: string, unit: string, value: string) => {
    const baseUnit = builder.metrics.get(metric)?.baseUnit
    if (baseUnit == null)
      throw new Error(`Invalid metric of ${metric}`)

    if (!builder.metrics.get(metric)?.units.has(unit))
      throw new Error(`Invalid metric or unit of ${metric}(${unit})`)

    const converted = builder.metrics.get(metric)!.units.get(unit)!.convertToBase(value)

    return converted
    //return Number(convertTo(metric, unit, metric, baseUnit, value))
  }

  const convertFromBase = (metric: string, toUnit: string, value: number, dp?: number) => {
    const baseUnit = builder.metrics.get(metric)?.baseUnit
    if (baseUnit == null)
      throw new Error(`Invalid metric of ${metric}(${unit})`)

    return convertTo(metric, baseUnit, metric, toUnit, value.toString(), dp)!
  }

  const hasMetric = function(metric: string){
    return builder.metrics.has(metric)
  }

  const hasUnit = function(metric: string, unit: string){
    return Boolean(builder.metrics.get(metric)?.units.get(unit))
  }

  const getMetricAliases = function(){
    return Array.from(builder.metrics.entries(), (kv) =>{
      return kv[1].alias
    })
  }

  const getUnitAliases = function(metric: string){
    return Array.from(builder.metrics.get(metric)!.units.entries(), (kv) =>{
      return kv[1].alias
    })
  }

  const getMetrics = function(){
    return Array.from(builder.metrics.entries())
  }

  const getUnits = function(metric: string){
    return Array.from(builder.metrics.get(metric)!.units.entries())
  }

  const getBaseUnit = function(metric: string){
    return builder.metrics.get(metric)?.baseUnit
  }

  const getCode = function(metric: string, unit: string){
    return builder.metrics.get(metric)?.units.get(unit)?.code
  }

  const getMetricAlias = function(metric: string){
    if (!builder.metrics.has(metric))
      throw new Error("Metric " + metric  + " does not exist")
    return builder.metrics.get(metric)!.alias
  }
  
  return {
    convertTo,
    hasMetric,
    hasUnit,
    getMetricAliases,
    getUnitAliases,
    getMetrics,
    getUnits,
    getBaseUnit,
    convertToBase,
    convertFromBase,
    getCode,
    getMetricAlias
  }
})()