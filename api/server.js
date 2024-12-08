// server/server.ts
import * as Path2 from "node:path";
import { formatDate } from "date-fns";
import express from "express";

// server/routes/logRouter.ts
import { Router } from "express";

// server/db/connection.ts
import knex from "knex";

// server/db/knexfile.js
import * as Path from "node:path";
import * as URL from "node:url";
var __filename = URL.fileURLToPath(import.meta.url);
var __dirname = Path.dirname(__filename);
var knexfile_default = {
  development: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: Path.join(__dirname, "dev.sqlite3")
    },
    pool: {
      afterCreate: (conn, cb) => conn.run("PRAGMA foreign_keys = ON", cb)
    }
  },
  test: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: ":memory:"
    },
    migrations: {
      directory: Path.join(__dirname, "migrations")
    },
    seeds: {
      directory: Path.join(__dirname, "seeds")
    },
    pool: {
      afterCreate: (conn, cb) => conn.run("PRAGMA foreign_keys = ON", cb)
    }
  },
  production: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "../../storage/prod.sqlite3"
    },
    pool: {
      afterCreate: (conn, cb) => conn.run("PRAGMA foreign_keys = ON", cb)
    }
  }
};

// server/db/connection.ts
var env = process.env.NODE_ENV || "development";
var connection = knex(knexfile_default[env]);
var connection_default = connection;

// Util.ts
var formatText = function(text) {
  return text.trim().replace(/\s+/g, " ");
};
var validDateRgx = /^\d{4}-\d{2}-\d{2}$/;
function toISODate(date) {
  return date.toISOString().substring(0, 10);
}
function toLocalISODate(date) {
  return toISODate(getLocalDate(date));
}
function createTimeStamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function fromISO(iso) {
  return new Date(iso);
}
var getWeekStart = (date) => {
  const day = date.getDay() == 0 ? 7 : date.getDay();
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - day + 1));
};
var getWeekEnd = (date) => {
  const day = date.getDay() == 0 ? 7 : date.getDay();
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + (7 - day)));
};
var getMonthStart = (date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
};
var getMonthEnd = (date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
};
var getLocalDate = (date) => {
  const utc = date == null ? /* @__PURE__ */ new Date() : date;
  return new Date(Date.UTC(utc.getTime() - utc.getTimezoneOffset() * 6e4));
};
var toMonthAndYear = (date, longHand = true) => {
  return longHand ? `${longHandMonths[date.getMonth()]} ${date.getFullYear()}` : `${shortHandMonths[date.getMonth()]} ${date.getFullYear()}`;
};
var divButtonHandler = (e) => {
  return e.key === "Enter" && e.target.click();
};
var shortHandMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var longHandMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var Util_default = {
  formatText,
  validDateRgx,
  toISODate,
  createTimeStamp,
  fromISO,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  toLocalISODate,
  getMonthEnd,
  shortHandMonths,
  longHandMonths,
  toMonthAndYear,
  divButtonHandler
};

// server/ProblemDetails.ts
var ProblemDetails = class _ProblemDetails {
  constructor(status = 400) {
    this.statusCode = status;
    this.message = "One or more errors has occured";
    this.errors = {};
  }
  static UserError(msg) {
    const pd = new _ProblemDetails();
    pd.message = msg;
    return pd;
  }
  static PropertyError(propertyName, msg) {
    const pd = new _ProblemDetails();
    pd.message = "There was a problem with one or more properties";
    pd.errors[propertyName] = [msg];
    return pd;
  }
  static PermissionError() {
    const pd = new _ProblemDetails(403);
    pd.message = "You do not have permission to perform this action";
    pd.errors.global = [pd.message];
    return pd;
  }
  static NullError(entityName) {
    const pd = new _ProblemDetails(404);
    pd.message = `This ${entityName} does not exist`;
    pd.errors.global = [pd.message];
    return pd;
  }
  static PropertyMissingError(propName) {
    const pd = new _ProblemDetails();
    pd.message = propName + " is required";
    pd.errors[propName] = [pd.message];
    return pd;
  }
  static UnknownError() {
    const pd = new _ProblemDetails(500);
    pd.message = "An unexpected error has occured";
    pd.errors.global = [pd.message];
    return pd;
  }
};

// server/db/dbUtil.ts
async function getAllGroups() {
  const result = await connection_default("logGroup");
  return result;
}
async function getAllRecords(logGroupId) {
  const result = await connection_default("logRecord").where({ logGroupId });
  return result;
}
async function addGroup(group) {
  const result = await connection_default("logGroup").insert({
    name: group.name,
    metric: group.metric,
    unit: group.unit,
    created: Util_default.createTimeStamp()
  }, "*");
  return result[0];
}
async function editGroup(group, id) {
  const result = await connection_default("logGroup").update({ ...group }, "*").where({ id });
  if (result.length === 0)
    throw ProblemDetails.NullError("group");
  return result[0];
}
async function deleteGroup(id) {
  await connection_default("logGroup").where({ id }).delete();
}
async function addRecord(record) {
  const result = await connection_default("logRecord").insert({
    value: record.value,
    date: record.date,
    created: Util_default.createTimeStamp(),
    logGroupId: record.logGroupId
  }, "*");
  return result[0];
}

// models/classes/LogGroup.ts
import { format } from "date-fns";

// models/classes/LogRecord.ts
var LogRecord = class {
  constructor(record, group) {
    this.id = record.id;
    this.value = record.value;
    this.date = record.date;
    this.created = record.created;
    this.logGroupId = record.logGroupId;
    this.freshlyAdded = false;
    this.logGroup = group;
  }
  update(record) {
    this.id = record.id;
    this.value = record.value;
    this.date = record.date;
    this.created = record.created;
    this.logGroupId = record.logGroupId;
  }
  getConvertedValue() {
    return this.logGroup.getConvertedValue(this.value);
  }
  getLineGraphValue() {
    return this.logGroup.getLineGraphValue(this.value);
  }
  getInputId() {
    return "record-input-" + this.id;
  }
  getStandardDate() {
  }
  static getSorter(order = "desc") {
    return function(a, b) {
      const d1 = new Date(a.date);
      const d2 = new Date(b.date);
      return order === "asc" ? d1.getTime() - d2.getTime() : d2.getTime() - d1.getTime();
    };
  }
};

// client/roundToX.ts
function roundToX(num, decimals) {
  return +(Math.round(num + "e" + decimals) + "e-" + decimals);
}

// models/classes/BaseConverters.ts
var basic = (x, fn) => {
  const n = Number(x);
  return x === "" || isNaN(n) ? null : fn(n);
};
var timeReg = /(^\d+:\d+:\d+$)|(^\d+:\d+$)|(^\d+$)/;
var UnitConverters = {
  Identity: {
    toBase: (x) => basic(x, (n) => n),
    fromBase: (n) => n.toString()
  },
  $: {
    fromBase: (n) => roundToX(n, 2).toFixed(2)
  },
  cm: {
    toBase: (x) => basic(x, (n) => n / 100),
    fromBase: (n) => (n * 100).toString()
  },
  km: {
    toBase: (x) => basic(x, (n) => n * 1e3),
    fromBase: (n) => (n / 1e3).toString()
  },
  mi: {
    toBase: (x) => basic(x, (n) => n / 621371e-9),
    fromBase: (n) => (n * 621371e-9).toString()
  },
  ft: {
    toBase: (x) => basic(x, (n) => n / 3.28084),
    fromBase: (n) => (n * 3.28084).toString()
  },
  g: {
    toBase: (x) => basic(x, (n) => n / 1e3),
    fromBase: (n) => (n * 1e3).toString()
  },
  lb: {
    toBase: (x) => basic(x, (n) => n * 0.45359237),
    fromBase: (n) => (n / 0.45359237).toString()
  },
  seconds: {
    toBase: (x) => basic(x, (n) => Math.abs(n)),
    fromBase: (n) => Math.abs(n).toString()
  },
  duration: {
    toBase: (x) => {
      const match = x.match(timeReg);
      if (match == null)
        return null;
      const parts = x.split(":").map((s) => Number(s));
      let hh = 0;
      let mm = 0;
      let ss = 0;
      switch (parts.length) {
        case 3:
          hh = parts[0] ?? 0;
          mm = parts[1] ?? 0;
          ss = parts[2] ?? 0;
          break;
        case 2:
          mm = parts[0] ?? 0;
          ss = parts[1] ?? 0;
          break;
        case 1:
          ss = parts[0] ?? 0;
      }
      const seconds = ss + 60 * mm + 3600 * hh;
      return seconds;
    },
    fromBase: (n) => {
      n = Math.abs(n);
      const hh = Math.floor(n / 3600);
      const mm = Math.floor(n % 3600 / 60);
      const ss = Math.round(n % 60);
      const zeroInFront = (n2) => {
        return n2 < 10 ? "0" + n2 : "" + n2;
      };
      if (hh === 0) {
        return `${zeroInFront(mm)}:${zeroInFront(ss)}`;
      } else
        return `${zeroInFront(hh)}:${zeroInFront(mm)}:${zeroInFront(ss)}`;
    }
  }
};
var BaseConverters_default = UnitConverters;

// models/classes/MetricHandler.ts
var Unit = class {
  constructor(metric, alias, code, convertToBase) {
    this.metric = metric;
    this.alias = alias;
    this.convertToBase = convertToBase;
    this.code = code;
  }
};
var BaseUnit = class extends Unit {
  constructor(metric, alias, code) {
    super(metric, alias, code, BaseConverters_default.Identity.toBase);
    this.converters = /* @__PURE__ */ new Map();
  }
};
var Metric = class {
  constructor(baseUnit, alias) {
    this.units = /* @__PURE__ */ new Map();
    this.baseUnit = baseUnit;
    this.alias = alias;
  }
  getBase() {
    return this.units.get(this.baseUnit);
  }
};
var MetricBuilder = class {
  constructor() {
    this.metrics = /* @__PURE__ */ new Map();
  }
};
var MetricHandler = function() {
  const builder = new MetricBuilder();
  const length = new Metric("M", "Length");
  const metre = length.units.set("cm", new Unit(length, "Centimeter", "cm", BaseConverters_default.cm.toBase)).set("M", new BaseUnit(length, "Meter", "m")).set("km", new Unit(length, "Kilometer", "km", BaseConverters_default.km.toBase)).set("mi", new Unit(length, "Mile", "mi", BaseConverters_default.mi.toBase)).set("ft", new Unit(length, "Feet", "ft", BaseConverters_default.ft.toBase)).get("M");
  metre.converters.set("cm", BaseConverters_default.cm.fromBase).set("km", BaseConverters_default.km.fromBase).set("M", BaseConverters_default.Identity.fromBase).set("mi", BaseConverters_default.mi.fromBase).set("ft", BaseConverters_default.ft.fromBase);
  const mass = new Metric("kg", "Weight");
  const kg = mass.units.set("kg", new BaseUnit(mass, "Kilogram", "kg")).set("g", new Unit(mass, "Gram", "g", BaseConverters_default.g.toBase)).set("lb", new Unit(mass, "Pound", "lb", BaseConverters_default.lb.toBase)).get("kg");
  kg.converters.set("kg", BaseConverters_default.Identity.fromBase).set("g", BaseConverters_default.g.fromBase).set("lb", BaseConverters_default.lb.fromBase);
  const time = new Metric("s", "Time");
  const seconds = time.units.set("s", new BaseUnit(time, "Seconds", "s")).set("duration", new Unit(time, "hh:mm:ss", "hh:mm:ss", BaseConverters_default.duration.toBase)).get("s");
  seconds.converters.set("s", BaseConverters_default.seconds.fromBase).set("duration", BaseConverters_default.duration.fromBase);
  seconds.convertToBase = BaseConverters_default.seconds.toBase;
  const currency = new Metric("$", "Currency");
  const dollars = currency.units.set("$", new BaseUnit(currency, "Dollars", "$")).get("$");
  dollars.converters.set("$", BaseConverters_default.$.fromBase);
  const unit = new Metric("unit", "Unit");
  const baseUnit = unit.units.set("unit", new BaseUnit(unit, "Unit", "units")).get("unit");
  baseUnit.converters.set("unit", BaseConverters_default.Identity.fromBase);
  builder.metrics.set("length", length).set("mass", mass).set("time", time).set("currency", currency).set("unit", unit);
  const convertTo = function(fromMetricCode, fromUnitCode, toMetricCode, toUnitCode, value, dp = 4) {
    const fromMetric = builder.metrics.get(fromMetricCode);
    const fromUnit = fromMetric?.units.get(fromUnitCode);
    const toMetric = builder.metrics.get(toMetricCode);
    const toUnit = toMetric?.units.get(toUnitCode);
    if (!fromMetric || !fromUnit || !toMetric || !toUnit)
      throw new Error("One of the metrics or units is invalid");
    const baseValue = fromUnit.convertToBase(value);
    if (baseValue == null) {
      console.error(`Cannot convert value ${value} from ${fromMetricCode}(${fromUnitCode}) to ${toMetricCode}(${toUnitCode})`);
      return null;
    }
    const converterFn = toMetric.getBase().converters.get(toUnitCode);
    const final = converterFn(baseValue);
    if (toMetricCode !== "currency" && final !== "" && !isNaN(Number(final)))
      return roundToX(Number(final), dp).toString();
    return final;
  };
  const convertToBase = (metric, unit2, value) => {
    const baseUnit2 = builder.metrics.get(metric)?.baseUnit;
    if (baseUnit2 == null)
      throw new Error(`Invalid metric of ${metric}`);
    if (!builder.metrics.get(metric)?.units.has(unit2))
      throw new Error(`Invalid metric or unit of ${metric}(${unit2})`);
    const converted = builder.metrics.get(metric).units.get(unit2).convertToBase(value);
    return converted;
  };
  const convertFromBase = (metric, toUnit, value, dp) => {
    const baseUnit2 = builder.metrics.get(metric)?.baseUnit;
    if (baseUnit2 == null)
      throw new Error(`Invalid metric of ${metric}(${unit})`);
    return convertTo(metric, baseUnit2, metric, toUnit, value.toString(), dp);
  };
  const hasMetric = function(metric) {
    return builder.metrics.has(metric);
  };
  const hasUnit = function(metric, unit2) {
    return Boolean(builder.metrics.get(metric)?.units.get(unit2));
  };
  const getMetricAliases = function() {
    return Array.from(builder.metrics.entries(), (kv) => {
      return kv[1].alias;
    });
  };
  const getUnitAliases = function(metric) {
    return Array.from(builder.metrics.get(metric).units.entries(), (kv) => {
      return kv[1].alias;
    });
  };
  const getMetrics = function() {
    return Array.from(builder.metrics.entries());
  };
  const getUnits = function(metric) {
    return Array.from(builder.metrics.get(metric).units.entries());
  };
  const getBaseUnit = function(metric) {
    return builder.metrics.get(metric)?.baseUnit;
  };
  const getCode = function(metric, unit2) {
    return builder.metrics.get(metric)?.units.get(unit2)?.code;
  };
  const getMetricAlias = function(metric) {
    if (!builder.metrics.has(metric))
      throw new Error("Metric " + metric + " does not exist");
    return builder.metrics.get(metric).alias;
  };
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
  };
}();

// models/classes/LogGroup.ts
var LogGroup = class _LogGroup {
  static {
    this.GroupByOptions = /* @__PURE__ */ new Set(["none", "week", "month"]);
  }
  static {
    this.GraphTypes = /* @__PURE__ */ new Set(["line", "column"]);
  }
  static {
    this.UnitBlacklist = /* @__PURE__ */ new Set(["unit", "duration"]);
  }
  static {
    this.GroupStats = /* @__PURE__ */ new Map([
      ["records", { alias: "Records", yLabel: "{P} Records" }],
      ["mean", { alias: "Average", yLabel: "Average {P} {L}" }],
      ["median", { alias: "Median", yLabel: "Median {P} {L}" }],
      ["max", { alias: "Max", yLabel: "Max {P} {L}" }],
      ["min", { alias: "Min", yLabel: "Min {P} {L}" }],
      ["total", { alias: "Total", yLabel: "Total {P} {L}" }]
    ]);
  }
  constructor(json) {
    this.id = json.id;
    this.name = json.name;
    this.metric = json.metric;
    this.unit = json.unit;
    this.created = json.created;
    this.groupBy = json.groupBy;
    this.graphType = json.graphType;
    this.yStat = json.yStat;
    this.logRecords = [];
  }
  update(json) {
    this.id = json.id;
    this.name = json.name;
    this.metric = json.metric;
    this.unit = json.unit;
    this.created = json.created;
    this.groupBy = json.groupBy;
    this.graphType = json.graphType;
    this.yStat = json.yStat;
  }
  addJsonRecord(json) {
    const instance = new LogRecord(json, this);
    this.logRecords.push(instance);
    return instance;
  }
  addJsonRecords(json) {
    json.forEach((record) => {
      this.addJsonRecord(record);
    });
  }
  getAnalytics() {
    return this.getStatsOfGroup(this.logRecords).formattedStats;
  }
  getStatsOfGroup(records) {
    const values = records.map((lr) => lr.value).sort((a, b) => a - b);
    let median;
    if (values.length === 0)
      median = null;
    else if (values.length % 2 === 0)
      median = 0.5 * (values[values.length / 2] + values[values.length / 2 - 1]);
    else
      median = values[Math.floor(values.length / 2)];
    const total = values.reduce((prev, cur) => prev + cur, 0);
    const preliminary = {
      min: values[0],
      max: values[values.length - 1],
      median,
      mean: values.length === 0 ? null : total / values.length,
      records: values.length,
      total
    };
    const formattedStats = {
      min: "",
      max: "",
      median: "",
      mean: "",
      records: "",
      total: ""
    };
    for (const key in preliminary) {
      const value = preliminary[key];
      if (key === "records") {
        formattedStats.records = value.toString();
        continue;
      } else if (value == null) {
        formattedStats[key] = "N/A";
        continue;
      }
      formattedStats[key] = this.getConvertedValueBlacklist(value);
    }
    return { formattedStats, rawStats: preliminary };
  }
  getPeriodStart(isoDate) {
    return this.groupBy === "week" ? Util_default.toISODate(Util_default.getWeekStart(Util_default.fromISO(isoDate))) : Util_default.toISODate(Util_default.getMonthStart(Util_default.fromISO(isoDate)));
  }
  getPeriodEnd(isoDate) {
    return this.groupBy === "week" ? Util_default.toISODate(Util_default.getWeekEnd(Util_default.fromISO(isoDate))) : Util_default.toISODate(Util_default.getMonthEnd(Util_default.fromISO(isoDate)));
  }
  getGroupData() {
    const allStats = [];
    const groupIndexes = [];
    let lastPeriodStart = null;
    for (let i = this.logRecords.length - 1; i >= 0; i--) {
      const record = this.logRecords[i];
      const periodStart = this.getPeriodStart(record.date);
      if (periodStart != lastPeriodStart) {
        lastPeriodStart = periodStart;
        groupIndexes.push(i);
      }
    }
    for (let i = groupIndexes.length - 1; i >= 0; i--) {
      const groupArr = this.logRecords.slice((groupIndexes[i + 1] ?? -1) + 1, groupIndexes[i] + 1);
      const { rawStats } = this.getStatsOfGroup(groupArr);
      const rs = rawStats;
      rs.dateStart = this.getPeriodStart(groupArr[0].date);
      rs.dateEnd = this.getPeriodEnd(groupArr[0].date);
      allStats.push(rs);
    }
    return allStats;
  }
  formId() {
    return "record-sheet-" + this.id;
  }
  isDuration() {
    return this.unit === "duration";
  }
  isTime() {
    return this.metric === "time";
  }
  convertGraphValue(graphValue) {
    switch (this.unit) {
      case "duration":
        return MetricHandler.convertFromBase(this.metric, this.unit, graphValue);
    }
    return roundToX(graphValue, 4);
  }
  sortRecords() {
    return this.logRecords.sort(LogRecord.getSorter());
  }
  getConvertedValue(value, includeSuffix = false) {
    return includeSuffix ? this.getConvertedValueWithUnit(value) : MetricHandler.convertFromBase(this.metric, this.unit, value);
  }
  getConvertedValueWithUnit(value) {
    switch (this.unit) {
      case "$": {
        const sym = value < 0 ? "-" : "";
        return sym + "$" + MetricHandler.convertFromBase(this.metric, this.unit, Math.abs(value));
      }
    }
    return MetricHandler.convertFromBase(this.metric, this.unit, value) + " " + MetricHandler.getCode(this.metric, this.unit);
  }
  getConvertedValueBlacklist(value) {
    return this.getConvertedValue(value, !_LogGroup.UnitBlacklist.has(this.unit));
  }
  getLineGraphValue(value) {
    const unit = this.unit;
    switch (unit) {
      case "duration":
        return Math.abs(value);
    }
    return Number(this.getConvertedValue(value));
  }
  getYLabel() {
    if (this.unit === "unit")
      return "";
    else if (this.unit === "$")
      return "Dollars ($)";
    return `${MetricHandler.getMetricAlias(this.metric)} (${MetricHandler.getCode(this.metric, this.unit)})`;
  }
  static getSorter(order = "desc") {
    return function(a, b) {
      const d1 = new Date(a.created);
      const d2 = new Date(b.created);
      return order === "asc" ? d1.getTime() - d2.getTime() : d2.getTime() - d1.getTime();
    };
  }
  static standardDate(date) {
    let da;
    if (typeof date === "string")
      da = new Date(date);
    else
      da = date;
    return format(da, "dd-MM-yyyy");
  }
};

// server/middleware/BodyValidator.ts
function ct(propName, propValue, expectedType) {
  if (typeof propValue !== expectedType)
    throw ProblemDetails.PropertyError(propName, `${propName} must be of type ${expectedType}`);
}
function cn(propName, propValue) {
  if (propValue == null)
    throw ProblemDetails.PropertyMissingError(propName);
}
function cna(dto, ...propertyNames) {
  for (const propertyName of propertyNames) {
    cn(propertyName, dto[propertyName]);
  }
}
var CreateLogGroup = function(req, res, next) {
  const dto = req.body;
  if (!dto || typeof dto !== "object")
    throw ProblemDetails.UserError("Expected an object");
  cna(dto, "name", "metric", "unit", "groupBy", "graphType", "yStat");
  ct("name", dto.name, "string");
  if (!MetricHandler.hasMetric(dto.metric))
    throw ProblemDetails.PropertyError("metric", `Invalid metric of '${dto.metric}'`);
  if (!MetricHandler.hasUnit(dto.metric, dto.unit))
    throw ProblemDetails.PropertyError("unit", `Invalid unit of '${dto.unit}'`);
  if (!LogGroup.GroupByOptions.has(dto.groupBy))
    throw ProblemDetails.PropertyError("groupBy", `Invalid groupBy of ${dto.groupBy}`);
  if (!LogGroup.GraphTypes.has(dto.graphType))
    throw ProblemDetails.PropertyError("graphType", `Invalid graphType of ${dto.graphType}`);
  if (!LogGroup.GroupStats.has(dto.yStat))
    throw ProblemDetails.PropertyError("graphType", `Invalid yStat of ${dto.yStat}`);
  req.body.name = Util_default.formatText(req.body.name);
  if (req.body.name.length < 1 || req.body.name.length > 32)
    throw ProblemDetails.PropertyError("name", "Name must be between 1 and 32 characters");
  next();
};
var mutableGroupProperties = /* @__PURE__ */ new Set(["name", "metric", "unit", "groupBy", "graphType", "yStat"]);
var mutableRecordProperties = /* @__PURE__ */ new Set(["date", "value"]);
function createMutateObj(mutateSet, obj) {
  const mutateObj = {};
  for (const key in obj) {
    if (mutateSet.has(key))
      mutateObj[key] = obj[key];
    else {
      throw ProblemDetails.PropertyError(key, `Property '${key}' either does not exist or can not be mutated`);
    }
  }
  if (Object.keys(mutateObj).length === 0)
    throw ProblemDetails.UserError("There doesn't appear to be anything to update.");
  return mutateObj;
}
var EditLogGroup = function(req, res, next) {
  const dto = req.body;
  if (!dto || typeof dto !== "object")
    throw ProblemDetails.UserError("Expected an object");
  if (dto.metric != null && !MetricHandler.hasMetric(dto.metric))
    throw ProblemDetails.PropertyError("metric", `Invalid metric of '${dto.metric}'`);
  if (dto.unit != null && !MetricHandler.hasUnit(dto.metric, dto.unit))
    throw ProblemDetails.PropertyError(dto.unit, `Invalid unit of '${dto.unit}'`);
  if (dto.groupBy != null && !LogGroup.GroupByOptions.has(dto.groupBy))
    throw ProblemDetails.PropertyError("groupBy", `Invalid groupBy of ${dto.groupBy}`);
  if (dto.graphType != null && !LogGroup.GraphTypes.has(dto.graphType))
    throw ProblemDetails.PropertyError("graphType", `Invalid graphType of ${dto.graphType}`);
  if (dto.yStat != null && !LogGroup.GroupStats.has(dto.yStat))
    throw ProblemDetails.PropertyError("graphType", `Invalid yStat of ${dto.yStat}`);
  if (dto.name != null) {
    req.body.name = Util_default.formatText(req.body.name);
    if (req.body.name.length < 1 || req.body.name.length > 32)
      throw ProblemDetails.PropertyError("name", "Name must be between 1 and 32 characters");
  }
  req.body = createMutateObj(mutableGroupProperties, dto);
  next();
};
var CreateLogRecord = function(req, res, next) {
  const dto = req.body;
  if (!dto || typeof dto !== "object")
    throw ProblemDetails.UserError("Expected an object");
  cna(dto, "value", "date", "logGroupId");
  ct("value", dto.value, "number");
  ct("date", dto.date, "string");
  ct("logGroupId", dto.logGroupId, "number");
  if (!Date.parse(dto.date) || !Util_default.validDateRgx.test(dto.date))
    throw ProblemDetails.PropertyError("date", "date is invalid, must be a valid date of type yyyy-mm-dd");
  next();
};
var EditLogRecord = function(req, res, next) {
  const dto = req.body;
  if (!dto || typeof dto !== "object")
    throw ProblemDetails.UserError("Expected an object");
  if (dto.date != null && (!Date.parse(dto.date) || !Util_default.validDateRgx.test(dto.date)))
    throw ProblemDetails.PropertyError("date", "date is invalid, must be a valid date of type yyyy-mm-dd");
  dto.value != null && ct("value", dto.value, "number");
  req.body = createMutateObj(mutableRecordProperties, dto);
  next();
};
var BodyValidator_default = { CreateLogGroup, EditLogGroup, CreateLogRecord, EditLogRecord };

// server/routes/logRouter.ts
var router = Router();
router.get("/loggroups", async (req, res) => {
  const logGroups = await getAllGroups();
  res.json(logGroups);
});
router.post("/loggroups", BodyValidator_default.CreateLogGroup, async (req, res) => {
  const result = await addGroup(req.body);
  res.status(201).json(result);
});
router.patch("/loggroups/:id", BodyValidator_default.EditLogGroup, async (req, res) => {
  const result = await editGroup(req.body, Number(req.params.id));
  res.json(result);
});
router.delete("/loggroups/:id", async (req, res) => {
  await deleteGroup(Number(req.params.id));
  res.sendStatus(200);
});
router.get("/logrecords", async (req, res) => {
  const logResults = await getAllRecords(Number(req.query.groupId));
  res.status(201).json(logResults);
});
router.post("/logrecord", BodyValidator_default.CreateLogRecord, async (req, res) => {
  const result = await addRecord(req.body);
  return res.json(result);
});
router.delete("/logrecord/:id", async (req, res) => {
  await connection_default("logRecord").where({ id: req.params.id }).delete();
  res.sendStatus(201);
});
router.patch("/logrecord/:id", BodyValidator_default.EditLogRecord, async (req, res) => {
  const record = await connection_default("logRecord").update({ ...req.body }, "*").where({ id: req.params.id });
  if (record.length != 1)
    throw ProblemDetails.NullError("record");
  res.json(record[0]);
});
router.delete("/deleteall", async (req, res) => {
  if (req.body.password !== "perf-log-123")
    res.status(403).send("No");
  await connection_default("logRecord").delete();
  await connection_default("logGroup").delete();
  res.sendStatus(200);
});
var logRouter_default = router;

// server/middleware/errorHandler.ts
async function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (process.env.NODE_ENV !== "production")
    console.log(err);
  if (err instanceof ProblemDetails) {
    res.status(err.statusCode);
    res.json(err);
    return;
  }
  const pd = ProblemDetails.UnknownError();
  res.status(pd.statusCode);
  res.json(pd);
}

// randomDateTime.js
function randomDateTime(dateStart, dateEnd) {
  const unixStart = dateStart.getTime();
  const unixEnd = dateEnd.getTime();
  const deltaUnix = unixEnd - unixStart;
  return new Date(unixStart + Math.random() * deltaUnix);
}

// server/db/seeds/logGroups.js
var rdt = (start) => {
  return randomDateTime(start || new Date(2024, 0, 1), new Date(2024, 10, 9)).toISOString();
};
var groups = [
  /*{
    id: 1,
    name: 'Weight Log',
    metric: 'mass',
    unit: 'kg',
    created: '2030-11-23T03:09:34.851Z'
  },*/
  {
    id: 2,
    name: "5k Run",
    metric: "time",
    unit: "duration",
    created: rdt()
  },
  {
    id: 3,
    name: "Steps Log",
    metric: "unit",
    unit: "unit",
    created: rdt()
  },
  {
    id: 4,
    name: "Spending Log",
    metric: "currency",
    unit: "$",
    created: rdt()
  }
];
var groupById = (id) => {
  return groups.find((x) => x.id === id);
};
var RecordBuilders = {
  "Weight Log": () => [],
  "5k Run": () => generateRandomRecords(2, 49, 1300, -15, 10, true),
  "Steps Log": () => generateRandomRecords(3, 350, 7500, -50, 70, true),
  "Spending Log": () => generateRandomRecords(4, 365, 70, -0.5, 0.5, false)
};
function generateRandomRecords(groupId, n, seedValue, deltaMin, deltaMax, integer) {
  const group = groupById(groupId);
  const records = [];
  const startDate = randomDateTime(new Date(2023, 11, 31), new Date(2024, 5, 30));
  for (let i = 0; i < n; i++) {
    const prev = records[i - 1]?.value ?? seedValue;
    startDate.setDate(startDate.getDate() + 1);
    records.push({
      value: integer ? Math.round(prev + (Math.random() * (deltaMax - deltaMin) + deltaMin)) : prev + (Math.random() * (deltaMax - deltaMin) + deltaMin),
      date: Util_default.toISODate(startDate),
      created: rdt(new Date(group.created)),
      logGroupId: groupId
    });
  }
  return records;
}
async function seed(knex2) {
  await knex2("logGroup").del().whereNot({ id: 1 });
  await knex2.raw("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'logGroup'");
  await knex2.raw("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'logRecord'");
  for (const group of groups) {
    await knex2("logGroup").insert(group);
    const records = RecordBuilders[group.name]();
    if (records.length == 0)
      continue;
    await knex2("logRecord").insert(records);
  }
}

// server/routes/snapshotRouter.ts
import { Router as Router2 } from "express";
import * as fs from "node:fs/promises";
var snapshotRouter = Router2();
var snapshotPath = "./server/snapshots";
async function createSnapshot() {
  const groupMap = /* @__PURE__ */ new Map();
  const snapshot = [];
  const groups2 = await connection_default("logGroup");
  for (const group of groups2) {
    snapshot.push({
      ...group,
      logRecords: []
    });
    groupMap.set(group.id, snapshot[snapshot.length - 1]);
  }
  const records = await connection_default("logRecord");
  for (const record of records) {
    groupMap.get(record.logGroupId)?.logRecords.push(record);
  }
  const filePath = `${snapshotPath}/snapshot_${Date.now()}`;
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));
  return snapshot;
}
async function loadSnapshot(fileName) {
  try {
    const jsonString = await fs.readFile(`${snapshotPath}/${fileName}`, { encoding: "utf8" });
    return JSON.parse(jsonString);
  } catch (e) {
    throw ProblemDetails.UserError("Snapshot does not exist");
  }
}
snapshotRouter.get("/", async (req, res) => {
  await createSnapshot();
  res.sendStatus(200);
});
function createInsert(tableName, columns, arr) {
  let query = `INSERT INTO ${tableName} (${columns.join(",")}) VALUES `;
  for (let i = 0; i < arr.length; i++) {
    query += "(";
    const obj = arr[i];
    for (let j = 0; j < columns.length; j++) {
      const key = columns[j];
      const value = obj[key];
      query += typeof value === "string" ? `"${value}"` : `${value}`;
      query += j + 1 === columns.length ? "" : ",";
    }
    query += ")";
    query += i + 1 === arr.length ? ";" : ",";
  }
  return query;
}
snapshotRouter.post("/", async (req, res) => {
  const body = req.body;
  const snapshot = await loadSnapshot(body.snapshotId);
  for (const snapGroup of snapshot) {
    if (!body.createNewIds)
      await connection_default("logGroup").delete().where({ id: snapGroup.id });
    const result = await connection_default("logGroup").insert({
      id: body.createNewIds ? void 0 : snapGroup.id,
      created: snapGroup.created,
      metric: snapGroup.metric,
      name: snapGroup.name,
      unit: snapGroup.unit
    }, "id");
    const queryRecords = snapGroup.logRecords.map((lr) => {
      return {
        value: lr.value,
        created: lr.created,
        logGroupId: result[0].id,
        date: lr.date
      };
    });
    const insertStatement = createInsert("logRecord", ["value", "created", "logGroupId", "date"], queryRecords);
    await connection_default.raw(insertStatement);
  }
  res.sendStatus(200);
});
var snapshotRouter_default = snapshotRouter;

// server/server.ts
var server = express();
server.use(express.json());
server.use("/api/v1/", logRouter_default);
server.use("/api/v1/snapshots", snapshotRouter_default);
server.get("/test", async (req, res) => {
  console.log(process.env);
  console.log(process.env.NODE_ENV);
  formatDate(/* @__PURE__ */ new Date(), "yyyy");
  res.status(200);
  res.send(process.env.NODE_ENV ?? "NODE_ENV NOT FOUND");
});
server.post("/api/v1/reset", async (req, res) => {
  if (req.body.password !== "perf-log-123")
    res.status(403).send("No");
  await seed(connection_default);
  res.send("DB Reset");
});
server.use(errorHandler);
if (process.env.NODE_ENV === "production") {
  server.use(express.static(Path2.resolve("public")));
  server.use("/assets", express.static(Path2.resolve("./dist/assets")));
  server.get("*wildcard", (req, res) => {
    res.sendFile(Path2.resolve("./dist/index.html"));
  });
}
var server_default = server;

// server/index.ts
var PORT = process.env.PORT || 3001;
server_default.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
