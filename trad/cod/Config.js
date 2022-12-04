function makeEnum(names) {
    return Object.freeze(
      names.reduce((o, n) => { 
        o[n] = Symbol(n); 
        return o;
      }, {})
    );
  }
  
 
  export const CONFIG_TYPE = makeEnum(
    ['BOOL', 'CHOOSE_ONE']
  );
  

  export const COPTS_ISA = makeEnum(
    ['AUTO', 'RV32I', 'RV64I']
  );
  

  export const configFields = {
    ISA: { name: 'ISA', type: CONFIG_TYPE.CHOOSE_ONE, opts: Object.values(COPTS_ISA) },
    ABI: { name: 'ABI', type: CONFIG_TYPE.BOOL,       default: false },
  }

  export const configDefault = Object.freeze(
    Object.fromEntries(
      Object.entries(configFields).map(
        ([k,v]) => [k, (v.default ?? v.opts[0])]
  )));
  