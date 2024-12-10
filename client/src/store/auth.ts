import { defineStore } from 'pinia';

import { AccountService } from '@/api/account';
import { AuthService } from '@/api/auth';
import { Account } from '@/types/account';
import { Auth } from '@/types/auth';
import { useStorage } from '@vueuse/core';

export const useAuthStore = defineStore('auth', () => {
    const state = useStorage('got-todo-authstore', {
        token: null as string | null,
        account: null as Account.Account | null,
    });

    const login = async (params: Auth.Login.Request) => {
        const {
            account,
            token,
        } = await AuthService.login(params);

        state.value.token = token;
        state.value.account = account;
    };

    const logout = async () => {
        state.value.token = null;
    };

    const me = async () => {
        if (state.value.token) {
            return await AccountService.me();
        }

        return null;
    };

    /**
     * 驗證 user 是否具備需求的角色
     */
    const havePermission = (requiredPermissions: string[], { strategy = 'allof' }: {strategy: 'allof' | 'oneof'}) => {
        if (!requiredPermissions) return false;
        if (!state.value || !state.value.account) return false;

        const { account } = state.value;

        if (!['allof', 'oneof'].includes(strategy)) {
            throw new Error(`Invalid permission strategy: ${strategy}`);
        }

        if (strategy === 'allof') {
            return requiredPermissions.every((p) => account.permissions.includes(p));
        }

        return requiredPermissions.some((p) => account.permissions.includes(p));
    };

    return {
        state,
        login,
        logout,
        me,
        havePermission,
    };
});
