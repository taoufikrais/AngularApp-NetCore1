using FXWIN.Data.Provider;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    public class WorkflowStatesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<WorkflowState>> GetWorkflowStates()
        {
            return await _db.WorkflowStates.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("WorkflowStates({Id})")]
        [ResponseType(typeof(WorkflowState))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetWorkflowState( int Id)
        {
            WorkflowState workflowState = await _db.WorkflowStates.SingleOrDefaultAsync(i => i.Id == Id);

            if (workflowState == null)
                return NotFound();

            return Ok(workflowState);
        }
    }
}