import GAME from '@/Game.js' 

import { vec3, quat2, mat4 } from 'gl-matrix'

class PlayerViewThirdPerson
{
    constructor(player)
    {
        this.world = new GAME.World()
        this.state = new GAME.STATE.State()
        this.viewport = this.world.viewport
        this.controls = this.world.controls

        this.player = player

        this.active = false
        this.worldUp = vec3.fromValues(0, 1, 0)
        this.position = vec3.create()
        this.quaternion = quat2.create()
        this.distance = 15
        this.phi = Math.PI * 0.45
        this.theta = - Math.PI * 0.25
        this.aboveOffset = 2
        this.phiLimits = { min: 0.1, max: Math.PI - 0.1 }
    }

    activate()
    {
        this.active = true
    }

    deactivate()
    {
        this.active = false
    }

    update()
    {
        if(!this.active)
            return

        // Phi and theta
        if(this.controls.pointer.down || this.viewport.pointerLock.active)
        {
            this.phi -= this.controls.pointer.delta.y * 2
            this.theta -= this.controls.pointer.delta.x * 2

            if(this.phi < this.phiLimits.min)
                this.phi = this.phiLimits.min
            if(this.phi > this.phiLimits.max)
                this.phi = this.phiLimits.max
        }
        
        // Position
        const sinPhiRadius = Math.sin(this.phi) * this.distance
        const sphericalPosition = vec3.fromValues(
            sinPhiRadius * Math.sin(this.theta),
            Math.cos(this.phi) * this.distance,
            sinPhiRadius * Math.cos(this.theta)
        )
        vec3.add(this.position, this.player.position.current, sphericalPosition)

        // Target
        const target = vec3.fromValues(
            this.player.position.current[0],
            this.player.position.current[1] + this.aboveOffset,
            this.player.position.current[2]
        )

        // Quaternion
        const toTargetMatrix = mat4.create()
        mat4.targetTo(toTargetMatrix, this.position, target, this.worldUp)
        quat2.fromMat4(this.quaternion, toTargetMatrix)
        
        // Clamp to ground
        const chunks = this.state.chunks
        const topology = chunks.getTopologyForPosition(this.position[0], this.position[2])

        if(topology && this.position[1] < topology.elevation + 1)
            this.position[1] = topology.elevation + 1
    }
}

GAME.register('STATE', 'PlayerViewThirdPerson', PlayerViewThirdPerson)
export default PlayerViewThirdPerson