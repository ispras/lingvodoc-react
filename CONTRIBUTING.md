# Contributing to Lingvodoc

## Table of contents
  * [Repositories responsibility](#repositories-responsibility)
  * [Contribution guides](#contribution-guides)
    + [Obligatory steps for everyone](#obligatory-steps-for-everyone)
    + [For ISP RAS contributors](#for-isp-ras-contributors)
      - [Frontend commits](#frontend-commits)
      - [Backend commits](#backend-commits)
    + [For external to ISP RAS contributors](#for-external-to-isp-ras-contributors)
  * [List of labels and their meaning](#list-of-labels-and-their-meaning)

## Repositories responsibility

The are two repositories for Lingvodoc project:

* [Backend repository](https://github.com/ispras/lingvodoc). It contains all the python code.
* [Frontend repository](https://github.com/ispras/lingvodoc-react). It contains all the js code.
* The only bug-tracker is located [here](https://github.com/ispras/lingvodoc-react/issues) for both repos.

## Contribution guides

### Obligatory steps for everyone

1. Create an issue in corresponding repository. **Each** implemented feature or bug must have separate issue.
2. The issue **must** contain the following information:
    * For all the types of issues you should fill up **steps to reproduce**. 
        * For bugs and new features - screenshots and step-by-step actions that lead to that bug or feature. That information is required for our testing engineer.
        * For feature request you should describe the required behaviour. If you are able to make a sketch, do it please.
3. Mark the issue with a correct type: [List of labels and their meaning](#label-list).
4. If you have created a bug-report wait for our response please.

### For ISP RAS contributors

#### Frontend commits
5. If the feature or bug is assigned to you, fix it please. Regressions are more important than new bugs or features.
6. Test your feature or fix locally with relevant database snapshot and docker-compose scenario from backend repository. The instructions for docker-compose scenario are located [here](https://github.com/ispras/lingvodoc/tree/heavy_refactor/docker).
7. Make a pull request to "staging" branch with a link to issue (use `#issue_number`)
8. Wait for Travis to build new release (5-10 minutes) and grab it [here](https://github.com/ispras/lingvodoc-react/releases). Please pay attention to the artifact date/time since github doesn't always sort builds by time. The build may be the second or third in the list.
9. In most cases you need to use the asset that is named `lingvodoc-react-server-build-<build-number>.tar.gz`
10. Test the feature or bugfix in our sandbox.
11. If everything's ok, go to your issue and close it.
12. Wait for review from tester. If everything's ok, tester will write something like "ok" and close the feature again. If tester doesn't close your issue, read the comment carefully, discuss it and goto 5.

#### Backend commits
5. If the feature or bug is assigned to you, fix it please. Regressions are more important than new bugs or features.
6. Grab the latest frontend build [here](https://github.com/ispras/lingvodoc-react/releases). Please pay attention to the artifact date/time since github doesn't always sort builds by time. The build may be the second or third in the list.
7. In most cases you need to use the asset that is named `lingvodoc-react-server-build-<build-number>.tar.gz`
8. Test your feature or fix locally with relevant database snapshot and docker-compose scenario from backend repository. The instructions for docker-compose scenario are located [here](https://github.com/ispras/lingvodoc/tree/heavy_refactor/docker).
9. Test the feature or bugfix in our sandbox.
10. If everything's ok, make a pull request to default branch with issue autoclose (use `fixes #issue_number` for bugs, `resolves #issue_number` for features/enhancements/etc).
11. Wait for review from tester. If everything's ok, tester will write something like "ok" and close the feature again. If tester doesn't close your issue, read the comment carefully, discuss it and goto 5.


### For external to ISP RAS contributors

5. Make sure you have completed steps 1-4.
6. Before sending pull-request you must synchronize and merge with default branch head (for backend) / "staging" branch head (for frontend), or ensure that it would be possible if you are planning to send a batch of pull requests.
6. Try to make commits in such a way that would make possible to separate pull requests by issues they are supposed to close. If it's not possible, that's not critical, but just give a try at least please.
7. Test your feature or fix locally with relevant database snapshot and docker-compose scenario from backend repository. The instructions for docker-compose scenario are located [here](https://github.com/ispras/lingvodoc/tree/heavy_refactor/docker).
8. Make a pull request to default branch (for backend) / "staging" branch (for frontend) with reference to corresponding issue.
9. Wait for ISP RAS to check and accept your pull request please.


## List of labels and their meaning

* bug - that means that something doesn't work as expected. Additional sub-labels are the following:
    * regression - the most important one. That means that something that was already fixed, stopped working again.
    * backend - bug is related to backend.
    * frontend - bug is related to frontend.
    * critical - bug is critical for the whole system. Should be fixed in the first place.
* enhancement - this label means that resolving the issue would improve some part of the system. There is additional label:
    * optimization - something that improves performance or storage space
* duplicate - means that there is another issue with the same contents. Usualy is needed just to point why the issue was closed prematurely; if you are closing an issue with that label you should reference the original one.
* wontfix - there is a reason not to resolve this issue. For bugs it means "actually it's not a bug" or "it's impossible to fix"; for enhancements that means that we don't want or able to do it.
* question - you just want to ask something


