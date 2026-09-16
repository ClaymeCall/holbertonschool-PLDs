export async function runModelJobs(modelClient, jobs) {
  return Promise.all(jobs.map(job => modelClient.generate(job)));
}
