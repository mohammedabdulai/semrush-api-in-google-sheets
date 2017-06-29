/* ---------------------------------------------------------------------------
* Semrush API functions (Google sheets) from Analytics API: https://www.semrush.com/api-analytics/ 
*
* @desc    Checks URLs for 301, 302, 307 and meta refresh hops
* @author  Dave Sottimano @dsottimano Twitter
* @license MIT (http://www.opensource.org/licenses/mit-license.php)
* @version 1.0
* -------------------------------------------------------------------------*/

//----------------------------------------------------------------------------



/* ---------------------------------------------------------------------------*
                             Global Object START 
* -------------------------------------------------------------------------*/
var Global = {
  data : {
    apiKey : "ENTER API KEY HERE",
    errorMessage : "Sorry, either you don't have valid API key in the Global object in the script editor or you don't have credits, please check your credentials and balance at https://www.semrush.com/billing-admin/profile/subscription/api-units",
    defaultDb : "us"
  },
  queries : {
    domainOrganic : "http://api.semrush.com/?type=domain_organic&key=",
    urlOrganic : "http://api.semrush.com/?type=url_organic&key=",
    keywordDifficulty: "http://api.semrush.com/?type=phrase_kdi&key=",
    phraseOrganic : "http://api.semrush.com/?type=phrase_organic&key=",
    keywordVolume : "http://api.semrush.com/?type=phrase_this&key=",
    relatedQueries : "http://api.semrush.com/?type=phrase_related&key=",
    domainOverview : "http://api.semrush.com/?type=domain_rank&key=",
    countUnits : "http://www.semrush.com/users/countapiunits.html?key="
  },
  methods : {
    giveApiRest : function () {
      Utilities.sleep(200)
    }
  }
}
/* ---------------------------------------------------------------------------*
                             Global Object END 
* -------------------------------------------------------------------------*/






/* ---------------------------------------------------------------------------*
                         Helper functions START 
* -------------------------------------------------------------------------*/


var checkAccount = function () {
  
  if (typeof Global.data.apiKey !== "string" ||  !Global.data.apiKey) {
    return false  
  } 
  try {
    var result = UrlFetchApp.fetch(Global.queries.countUnits + Global.data.apiKey).getContentText()
    Browser.msgBox("You have : " + result + " API credits left")
    if (result == 0) return false
    return true
  } catch (e) {
    return e
  }
}

//true by default, 
var parseApiResponse  = function(result,valueBoolean) { 
  var data = [], valueBoolean
  valueBoolean ? valueBoolean = 1 : valueBoolean = 0
  var lines = result.split("\n");
  
  try {
    for(i=valueBoolean;i<lines.length;i++) {
      data.push(lines[i].split(";"));
    }
    return data
  } catch(e) {
    return e
  }
}  

function onOpen() {
  SpreadsheetApp.getUi() 
  .createMenu('Semrush Functions')
  .addItem('Check API balance', 'checkAccount')
  .addToUi();
}
/* ---------------------------------------------------------------------------*
                         Helper functions END 
* -------------------------------------------------------------------------*/





/* ---------------------------------------------------------------------------*
                        MAIN functions START 
* -------------------------------------------------------------------------*/


/**
* Returns Semrush domain history for a specified domain from January 2012 onwards
*
* @param {"example.com"} domain REQUIRED The root domain, example: "nytimes.com", DO NOT include protocol (http/https)
* @param {"us"} db OPTIONAL The country database you want to search from. Default is US
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {201601} date OPTIONAL Leave this blank for current data. YYYYMM format for historical reports, note: always reports on the 15th of the month. 
* @return Returns organic keywords count, organic traffic, organic cost, adwords data
* @customfunction
*/

function domainOverview(domain,db,includeHeader,date) {
  if (!domain || domain.indexOf("http") > -1) return "Error: Enter a valid domain, do not include protocol"
  var displayDate = "&display_date=", db = db || Global.data.defaultDb
  
  if (!checkAccount()) return Global.data.errorMessage
  
  date ? displayDate+= date + "15" : displayDate = ""
  
  Global.methods.giveApiRest()
 
  try {
    var result = UrlFetchApp.fetch(Global.queries.domainOverview+Global.data.apiKey+"&export_columns=Or,Ot,Oc,Ad,At,Ac&domain="+domain+"&database="+db+displayDate).getContentText()
    } catch (e) {
      return result
    }
  
  return parseApiResponse(result,includeHeader)
  
}























/**
* Returns Semrush Organic keywords for a specified domain
*
* @param {"example.com"} domain REQUIRED The root domain, example: "nytimes.com", DO NOT include protocol (http/https)
* @param {true} filterBy OPTIONAL Use true to include the query in the filter or false to remove the query in the filter. Default is true
* @param {true} matchType OPTIONAL Use true for partial match, use false for exact match. Default is true, partial match 
* @param {"apartments"} query OPTIONAL The keyword you want to filter by. Relies on previous 2 parameters. Example: "brown shoes".
* @param {10} limit OPTIONAL Number from 1 to 10000
* @param {"us"} db OPTIONAL The country database you want to search from. Default is US
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {201601} date OPTIONAL Leave this blank for current data. YYYYMM format for historical reports, note: always reports on the 15th of the month. 
* @return Access organic keywords for a domain from semrush.com database
* @customfunction
*/

function domainOrganicKeywords(domain,filterBy,matchType,query,limit,db,includeHeader,date) {
  if (!domain || domain.indexOf("http") > -1) return "Error: Enter a valid domain, do not include protocol"
  var displayDate = "&display_date=", filterOperator,filterBy,includeHeader,query = query || "", limit = limit || 1, db = db || Global.data.defaultDb, filterBy = filterBy && true, matchType = matchType && true
  
  if (!checkAccount()) return Global.data.errorMessage
  
  date ? displayDate+= date + "15" : displayDate = ""
  
  filterBy ? filterBy = "%2B" : filterBy = "-" 
  matchType ? matchType = "Co" : matchType = "Eq"
  
  Global.methods.giveApiRest()
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.domainOrganic+Global.data.apiKey+"&display_limit="+limit+"&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr&domain="+domain+"&display_sort=tr_desc&database="+db+"&display_filter="+filterBy+"%7CPh%7C"+matchType+"%7C"+query+displayDate).getContentText()
    } catch (e) {
      return result
    }
  
  return parseApiResponse(result,includeHeader)
  
}

/**
* Returns Ranking Semrush Organic keywords per URL
* @param {"http://example.com"} url REQUIRED The exact URL you want data for, MUST include protocol (http/https)
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {"10"} limit OPTIONAL Number from 1 to 10,000, for number of results
* @param {"US"} db OPTIONAL The database, example "US" for American database. Default is US
* @return Access organic keywords for a url from semrush.com database
* @customfunction
*/


function urlOrganicKeywords(url,includeHeader,limit,db) {
  var db = db || Global.data.defaultDb, limit = limit || 10
  if (!url || url.indexOf("http") == -1) return "Error: Enter a valid URL, ensure you include the protocol"
  
  //semrush won't report on a homepage unless it has a trailing slash
  if (url.match(/\//g).length < 3) url += "/" 
  if (!checkAccount()) return Global.data.errorMessage
  
  Global.methods.giveApiRest();
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.urlOrganic + Global.data.apiKey+ "&display_limit="+limit+"&export_columns=Ph,Po,Nq,Cp,Co,Tr,Tc,Nr,Td&url="+url+"&database="+db).getContentText();
    return parseApiResponse(result,includeHeader)
  } catch(e) {
    return e
  }
}


/**
* Returns Semrush Keyword Difficulty for a keyword 
*
* @param {"apartments"} query REQUIRED The keyword you want information for. Example: "brown shoes".
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {"us"} db OPTIONAL The country database you want to search from. Default is US
* @return Access keyword difficulty for keyword from semrush
* @customfunction
*/

function keywordDifficulty(query, includeHeader,db) {
  if (!query) return "Error: Missing query"
  var db = db || Global.data.defaultDb
  
  if (!checkAccount()) return Global.data.errorMessage
  Global.methods.giveApiRest();
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.keywordDifficulty + Global.data.apiKey+ "&export_columns=Ph,Kd&phrase="+query+"&database=" + db).getContentText();
    return parseApiResponse(result,includeHeader)
  } catch(e) {
    return e 
  }
}

/**
* Returns Semrush organic search results for a specific keyword
*
* @param {"apartments"} query REQUIRED The keyword you want information for. Example: "brown shoes".
* @param {10} limit OPTIONAL Number from 10 to 20, for number of results. Default is 10
* @param {"us"} db OPTIONAL The country database you want to search from. Default is US
* @return Access organic search results for a keyword from semrush.com database
* @customfunction
*/

function serps(query,limit,db) {
  if (!query) return "Error: Missing query"
  var db = db || Global.data.defaultDb, limit = limit || 10
  if (!checkAccount()) return Global.data.errorMessage  
  Global.methods.giveApiRest()
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.phraseOrganic + Global.data.apiKey+"&display_limit="+limit+"&export_columns=Ur&phrase="+query+"&database="+db).getContentText()
    return parseApiResponse(result)
  } catch (e) {
    return e
  }
}

/**
* Returns Related search queries for a keyword from Semrush
*
* @param {"apartments"} query REQUIRED The keyword you want information for. Example: "brown shoes".
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {10} limit OPTIONAL The number of results. Default is 1
* @param {"us"} db OPTIONAL The country database you want to search from. Default is US
* @return Returns related queries for a specific keyword from semrush.com
* @customfunction
*/


function relatedQueries(query,includeHeader,limit,db) {
  
  if (!query) return "Error: Missing query"
  var limit = limit || 1, db = db || Global.data.defaultDb
  Global.methods.giveApiRest()
  if (!checkAccount()) return Global.data.errorMessage 
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.relatedQueries + Global.data.apiKey+"&display_limit="+limit+"&export_columns=Ph,Nq,Cp,Co,Nr,Td&phrase="+query+"&database="+db+"&display_sort=nq_desc").getContentText();
    return parseApiResponse(result,includeHeader)
  } catch(e) {
    return e
  }
  
}

/**
* Returns Keyword Volume from semrush
*
* @param {"apartments"} query REQUIRED The keyword you want information for. Example: "brown shoes".
* @param {true} includeHeader OPTIONAL true to EXCLUDE column headers or false to include. Default is false.
* @param {"us"} db OPTIONAL The country database you want to search from, default is "us"
* @return Returns search volume, cpc, etc..
* @customfunction
*/

function keywordVolume(query,includeHeader,db) {
  if (!query) return "Error: Missing query"
  var db = db || Global.data.defaultDb
  
  Global.methods.giveApiRest()
  
  if (!checkAccount()) return Global.data.errorMessage 
  
  try {
    var result = UrlFetchApp.fetch(Global.queries.keywordVolume + Global.data.apiKey+"&export_columns=Ph,Nq,Cp,Co,Nr&phrase="+query+"&database="+db).getContentText()
    return parseApiResponse(result,includeHeader)
  } catch (e) {
    return e
  }
}

/* ---------------------------------------------------------------------------*
                        MAIN functions END 
* -------------------------------------------------------------------------*/
