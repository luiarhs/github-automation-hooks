const { app } = require('@azure/functions');
const { Octokit } = require("@octokit/core");



app.http('AddReposToWriteTeam', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`)

        const octokit = new Octokit({
            auth: `${process.env["GITHUB_TOKEN"]}`,
            baseUrl: `${process.env["GITHUB_URL"]}`
        })
        
        try {
            var org = 'VideoTile'
            // const organizations = await octokit.request('GET /organizations', {
            //     headers: {
            //         'X-GitHub-Api-Version': '2022-11-28'
            //     }
            // })

            // context.log(organizations.data.forEach(org => {org.login}))

            const repos = await octokit.request(`GET /orgs/${org}/repos/`, {
                per_page: 100,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            repos.data.forEach(async (repo) => {
                try {
                    await octokit.request(`PUT /orgs/${repo.owner.login}/teams/${repo.owner.login}-write/repos/${repo.owner.login}/${repo.name}`, {
                        permission: 'push',
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    })
                } catch (error) {
                    context.error(error)
                }
            })

            // organizations.forEach(async (org) => {
            //     try {
            //         await octokit.request(`GET /orgs/${org.login}/teams/${org.login}-Write}`, {
            //             headers: {
            //                 'X-GitHub-Api-Version': '2022-11-28'
            //             }
            //         })
            //     } catch (error) {
            //         context.error(error)
            //     }
            // })
            return { body: 200 }
        } catch (error) {
            context.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
            throw error
        }
        // const name = request.query.get('name') || await request.text() || 'world';
    }
});
