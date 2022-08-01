from heimdall_utils.utils import JSONUtils, Logger


class AbstractBitbucket:
    def __init__(self, service, name):
        self.service = service
        self.log = Logger(name)
        self.json_utils = JSONUtils(self.log)

    def is_public(self, repo: dict) -> bool:
        pass

    def has_next_page(self, response_dict: dict) -> bool:
        pass

    def get_cursor(self, response_dict: dict):
        pass

    def get_branch_name(self, ref: dict) -> str:
        pass

    def construct_bitbucket_org_url(self, url: str, org: str, cursor: str) -> str:
        pass

    def construct_bitbucket_repo_url(self, url: str, org: str, repo: str, cursor: str) -> str:
        pass

    def construct_bitbucket_branch_url(self, url: str, org: str, repo: str, cursor: str):
        pass

    def get_default_cursor(self):
        pass
