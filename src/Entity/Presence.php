<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\PresenceRepository;
use App\Utils\TimeTampTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;

#[ORM\Entity(repositoryClass: PresenceRepository::class)]
#[ApiResource(
    operations: [
        new Post(),
        new GetCollection(
            uriTemplate: '/presences/all',
            paginationEnabled: false,
        ),

        new Get(),
        new Patch(),
        new Delete(),
    ],
)]
#[HasLifecycleCallbacks]
class Presence
{
    use TimeTampTrait;
    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\ManyToOne(inversedBy: 'presences')]
    private ?Filiere $filieres = null;

    #[ORM\ManyToOne(inversedBy: 'presences')]
    private ?Enseignement $enseignements = null;

    #[ORM\ManyToOne(inversedBy: 'presences')]
    private ?Enseignant $enseignants = null;

    /**
     * @var Collection<int, Etudiant>
     */
    #[ORM\OneToMany(targetEntity: Etudiant::class, mappedBy: 'presence')]
    private Collection $etudiants;

    #[ORM\Column]
    private ?bool $status = null;

    /**
     * @var Collection<int, Justifications>
     */
    #[ORM\OneToMany(targetEntity: Justifications::class, mappedBy: 'presences')]
    private Collection $justifications;

    public function __construct()
    {
        $this->etudiants = new ArrayCollection();
        $this->justifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getFilieres(): ?Filiere
    {
        return $this->filieres;
    }

    public function setFilieres(?Filiere $filieres): static
    {
        $this->filieres = $filieres;

        return $this;
    }

    public function getEnseignements(): ?Enseignement
    {
        return $this->enseignements;
    }

    public function setEnseignements(?Enseignement $enseignements): static
    {
        $this->enseignements = $enseignements;

        return $this;
    }

    public function getEnseignants(): ?Enseignant
    {
        return $this->enseignants;
    }

    public function setEnseignants(?Enseignant $enseignants): static
    {
        $this->enseignants = $enseignants;

        return $this;
    }

    /**
     * @return Collection<int, Etudiant>
     */
    public function getEtudiants(): Collection
    {
        return $this->etudiants;
    }

    public function addEtudiant(Etudiant $etudiant): static
    {
        if (!$this->etudiants->contains($etudiant)) {
            $this->etudiants->add($etudiant);
            $etudiant->setPresence($this);
        }

        return $this;
    }

    public function removeEtudiant(Etudiant $etudiant): static
    {
        if ($this->etudiants->removeElement($etudiant)) {
            // set the owning side to null (unless already changed)
            if ($etudiant->getPresence() === $this) {
                $etudiant->setPresence(null);
            }
        }

        return $this;
    }

    public function isStatus(): ?bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): static
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return Collection<int, Justifications>
     */
    public function getJustifications(): Collection
    {
        return $this->justifications;
    }

    public function addJustification(Justifications $justification): static
    {
        if (!$this->justifications->contains($justification)) {
            $this->justifications->add($justification);
            $justification->setPresences($this);
        }

        return $this;
    }

    public function removeJustification(Justifications $justification): static
    {
        if ($this->justifications->removeElement($justification)) {
            // set the owning side to null (unless already changed)
            if ($justification->getPresences() === $this) {
                $justification->setPresences(null);
            }
        }

        return $this;
    }
}
