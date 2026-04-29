<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\MatiereRepository;
use App\Utils\TimeTampTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MatiereRepository::class)]
#[ApiResource(
    operations: [
        new Post(),
        new GetCollection(
            uriTemplate: '/matieres/all',
            paginationEnabled: false,
        ),

        new Get(),
        new Patch(),
        new Delete(),
    ],
)]
#[ORM\HasLifecycleCallbacks]
class Matiere
{
     use TimeTampTrait;
     
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    /**
     * @var Collection<int, Enseignement>
     */
    #[ORM\OneToMany(targetEntity: Enseignement::class, mappedBy: 'matiere')]
    private Collection $enseignements;

    /**
     * @var Collection<int, Filiere>
     */
    #[ORM\ManyToMany(targetEntity: Filiere::class, mappedBy: 'correspondre')]
    private Collection $filieres;

    #[ORM\Column(length: 255)]
    private ?string $coefficient = null;

    #[ORM\Column(length: 255)]
    private ?string $volumeHoraire = null;

    public function __construct()
    {
        $this->enseignements = new ArrayCollection();
        $this->filieres = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    /**
     * @return Collection<int, Enseignement>
     */
    public function getEnseignements(): Collection
    {
        return $this->enseignements;
    }

    public function addEnseignement(Enseignement $enseignement): static
    {
        if (!$this->enseignements->contains($enseignement)) {
            $this->enseignements->add($enseignement);
            $enseignement->setMatiere($this);
        }

        return $this;
    }

    public function removeEnseignement(Enseignement $enseignement): static
    {
        if ($this->enseignements->removeElement($enseignement)) {
            // set the owning side to null (unless already changed)
            if ($enseignement->getMatiere() === $this) {
                $enseignement->setMatiere(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Filiere>
     */
    public function getFilieres(): Collection
    {
        return $this->filieres;
    }

    public function addFiliere(Filiere $filiere): static
    {
        if (!$this->filieres->contains($filiere)) {
            $this->filieres->add($filiere);
            $filiere->addCorrespondre($this);
        }

        return $this;
    }

    public function removeFiliere(Filiere $filiere): static
    {
        if ($this->filieres->removeElement($filiere)) {
            $filiere->removeCorrespondre($this);
        }

        return $this;
    }

    public function getCoefficient(): ?string
    {
        return $this->coefficient;
    }

    public function setCoefficient(string $coefficient): static
    {
        $this->coefficient = $coefficient;

        return $this;
    }

    public function getVolumeHoraire(): ?string
    {
        return $this->volumeHoraire;
    }

    public function setVolumeHoraire(string $volumeHoraire): static
    {
        $this->volumeHoraire = $volumeHoraire;

        return $this;
    }
}
