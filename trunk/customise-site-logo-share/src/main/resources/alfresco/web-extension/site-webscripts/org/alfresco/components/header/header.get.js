/**
 * Share Header component GET method
 */

const PREF_COLLAPSED_TWISTERS = "org.alfresco.share.twisters.collapsed";

/**
 * Twister Preferences
 */
function getTwisterPrefs()
{
   var collapsedTwisters = "",
      result,
      response;

   result = remote.call("/api/people/" + encodeURIComponent(user.name) + "/preferences");
   if (result.status == 200 && result != "{}")
   {
      response = eval('(' + result + ')');
      collapsedTwisters = eval('try{(response.' + PREF_COLLAPSED_TWISTERS + ')}catch(e){}');
      if (typeof collapsedTwisters != "string")
      {
         collapsedTwisters = "";
      }
   }
   model.collapsedTwisters = collapsedTwisters;
}

/**
 * Site Title
 */
function getSiteTitle()
{
   var siteTitle = "",
      result,
      response,
      siteLogo = "";

   var siteId = page.url.templateArgs.site || "";
   if (siteId == "")
   {
      siteLogo = context.getSiteConfiguration().getProperty("logo");
   } else {
      result = remote.call("/api/sites/" + encodeURIComponent(siteId));
      if (result.status == 200 && result != "{}")
      {
         response = eval('(' + result + ')');
         siteTitle = response.title;
         siteLogo = response.siteLogo;
         if (typeof siteTitle != "string")
         {
            siteTitle = "";
         }
         
         if (typeof siteLogo != "string")
         {
        	 siteLogo = "";
         }
      }
   }
   model.siteTitle = siteTitle;
   model.logo = siteLogo;
}

/**
 * Customizable Header
 */
function getHeader()
{
   // Array of tokenised values for use in i18n messages
   model.labelTokens = [ user.name || "", user.firstName || "", user.lastName || "", user.fullName || ""];
   model.permissions =
   {
      guest: user.isGuest,
      admin: user.isAdmin
   };
}

/**
 * User Status
 */
function getUserStatus()
{
   var userStatus = msg.get("status.default"),
      userStatusTime = "";
   
   if (user.properties["userStatus"] != null)
   {
      userStatus = user.properties["userStatus"];
   }
   if (user.properties["userStatusTime"] != null)
   {
      userStatusTime = user.properties["userStatusTime"];
   }
   
   model.userStatus = userStatus;
   model.userStatusTime = userStatusTime;
}

/**
 * License usage warnings and errors
 */
function getLicenseInfo()
{
   // Only retrieve license usage information for the first few seconds after login
   // this ensures the usage information is not continually queried.
   // This could be improved by having a central usage service on the web-tier that
   // is reponsible for retrieving the usage in a more sensible schedule.
   if (context.properties["editionInfo"].edition != "UNKNOWN" &&
       user.properties["alfUserLoaded"] > new Date().getTime() - 5000)
   {
      // retrieve license usage information
      var result = remote.call("/api/admin/usage");
      if (result.status.code == status.STATUS_OK)
      {
         usage = eval('(' + result + ')');
         // if warnings or errors are present, display them to the admin or user
         // admin sees messages if WARN_ADMIN, WARN_ALL, LOCKED_DOWN
         // users see messages if WARN_ALL, LOCKED_DOWN
         if ( (user.isAdmin && (usage.warnings.length != 0 || usage.errors.length != 0)) ||
              (usage.level >= 2 && (usage.warnings.length != 0 || usage.errors.length != 0)) )
         {
            model.usage = usage;
         }
      }
   }
}

function main()
{
   getTwisterPrefs();
   getSiteTitle();
   getHeader();
   getUserStatus();
   getLicenseInfo();
}

if (!user.isGuest)
{
   main();
}